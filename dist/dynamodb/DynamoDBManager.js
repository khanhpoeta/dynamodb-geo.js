"use strict";
/*
 * Copyright 2010-2013 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBManager = void 0;
const S2Manager_1 = require("../s2/S2Manager");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
class DynamoDBManager {
    constructor(config) {
        this._config = config;
        this._ddbDocClient = lib_dynamodb_1.DynamoDBDocumentClient.from(config.dynamoDBClient);
    }
    /**
     * Query Amazon DynamoDB
     *
     * @param queryInput
     * @param hashKey
     *            Hash key for the query request.
     *
     * @param range
     *            The range of geohashs to query.
     *
     * @return The query result.
     */
    async queryGeohash(queryInput, hashKey, range) {
        const queryOutputs = [];
        const nextQuery = async (lastEvaluatedKey) => {
            const input = { KeyConditions: {} };
            input.KeyConditions[this._config.hashKeyAttributeName] = {
                ComparisonOperator: 'EQ',
                AttributeValueList: [hashKey],
            };
            const minRange = range.rangeMin;
            const maxRange = range.rangeMax;
            const defaults = {
                TableName: this._config.tableName,
                KeyConditions: input.KeyConditions,
                IndexName: this._config.geohashIndexName,
                ConsistentRead: this._config.consistentRead,
                ReturnConsumedCapacity: 'TOTAL',
                FilterExpression: 'geohash BETWEEN :minRange AND :maxRange' +
                    (queryInput?.FilterExpression || ''),
                ExpressionAttributeValues: {
                    ...queryInput?.ExpressionAttributeValues,
                    ':minRange': minRange,
                    ':maxRange': maxRange,
                },
                ExclusiveStartKey: lastEvaluatedKey,
            };
            const queryOutput = await this._ddbDocClient.send(new lib_dynamodb_1.QueryCommand(defaults));
            if (queryOutput.Items) {
                queryOutputs.push(queryOutput);
            }
            if (queryOutput.LastEvaluatedKey) {
                return nextQuery(queryOutput.LastEvaluatedKey);
            }
        };
        await nextQuery();
        return queryOutputs;
    }
    getPoint(getPointInput) {
        const geohash = S2Manager_1.S2Manager.generateGeohash(getPointInput.GeoPoint);
        const hashKey = S2Manager_1.S2Manager.generateHashKey(geohash, this._config.hashKeyLength);
        const getItemInput = getPointInput.GetItemInput;
        const commandInput = {
            TableName: this._config.tableName,
            Key: {
                [this._config.hashKeyAttributeName]: hashKey.toString(10),
                [this._config.rangeKeyAttributeName]: getPointInput.RangeKeyValue,
            },
        };
        if (getItemInput) {
            commandInput.TableName = getItemInput.TableName;
            commandInput.Key = getItemInput.Key;
        }
        return this._ddbDocClient.send(new lib_dynamodb_1.GetCommand(commandInput));
    }
    putPoint(putPointInput) {
        const geohash = S2Manager_1.S2Manager.generateGeohash(putPointInput.GeoPoint);
        const hashKey = S2Manager_1.S2Manager.generateHashKey(geohash, this._config.hashKeyLength);
        const item = {
            [this._config.hashKeyAttributeName]: hashKey,
            [this._config.rangeKeyAttributeName]: putPointInput.RangeKeyValue,
            [this._config.geohashAttributeName]: geohash,
            [this._config.geoJsonAttributeName]: JSON.stringify({
                type: this._config.geoJsonPointType,
                coordinates: this._config.longitudeFirst
                    ? [putPointInput.GeoPoint.longitude, putPointInput.GeoPoint.latitude]
                    : [putPointInput.GeoPoint.latitude, putPointInput.GeoPoint.longitude],
            }),
        };
        const putItemParams = {
            Item: {
                ...item,
                ...(putPointInput.PutItemInput && putPointInput.PutItemInput.Item),
            },
            TableName: this._config.tableName,
        };
        return this._ddbDocClient.send(new lib_dynamodb_1.PutCommand(putItemParams));
    }
    batchWritePoints(putPointInputs) {
        const RequestItems = {};
        const writeInputs = putPointInputs.map(i => {
            const geohash = S2Manager_1.S2Manager.generateGeohash(i.GeoPoint);
            const hashKey = S2Manager_1.S2Manager.generateHashKey(geohash, this._config.hashKeyLength);
            const putItemInput = i.PutItemInput;
            let Item = {};
            if (putItemInput.Item) {
                Item = putItemInput.Item;
            }
            Item[this._config.hashKeyAttributeName] = hashKey;
            Item[this._config.rangeKeyAttributeName] = i.RangeKeyValue;
            Item[this._config.geohashAttributeName] = geohash;
            Item[this._config.geoJsonAttributeName] = JSON.stringify({
                type: this._config.geoJsonPointType,
                coordinates: this._config.longitudeFirst
                    ? [i.GeoPoint.longitude, i.GeoPoint.latitude]
                    : [i.GeoPoint.latitude, i.GeoPoint.longitude],
            });
            return {
                PutRequest: {
                    Item,
                },
            };
        });
        RequestItems[this._config.tableName] = writeInputs;
        return this._ddbDocClient.send(new lib_dynamodb_1.BatchWriteCommand({ RequestItems }));
    }
    updatePoint(updatePointInput) {
        const geohash = S2Manager_1.S2Manager.generateGeohash(updatePointInput.GeoPoint);
        const hashKey = S2Manager_1.S2Manager.generateHashKey(geohash, this._config.hashKeyLength);
        updatePointInput.UpdateItemInput.TableName = this._config.tableName;
        if (!updatePointInput.UpdateItemInput.Key) {
            updatePointInput.UpdateItemInput.Key = {};
        }
        updatePointInput.UpdateItemInput.Key[this._config.hashKeyAttributeName] =
            hashKey.toString(10);
        updatePointInput.UpdateItemInput.Key[this._config.rangeKeyAttributeName] =
            updatePointInput.RangeKeyValue;
        // Geohash and geoJson cannot be updated.
        if (updatePointInput.UpdateItemInput.AttributeUpdates) {
            delete updatePointInput.UpdateItemInput.AttributeUpdates[this._config.geohashAttributeName];
            delete updatePointInput.UpdateItemInput.AttributeUpdates[this._config.geoJsonAttributeName];
        }
        return this._ddbDocClient.send(new lib_dynamodb_1.UpdateCommand(updatePointInput.UpdateItemInput));
    }
    deletePoint(deletePointInput) {
        const geohash = S2Manager_1.S2Manager.generateGeohash(deletePointInput.GeoPoint);
        const hashKey = S2Manager_1.S2Manager.generateHashKey(geohash, this._config.hashKeyLength);
        return this._config.dynamoDBClient.send(new lib_dynamodb_1.DeleteCommand({
            ...deletePointInput,
            TableName: this._config.tableName,
            Key: {
                [this._config.hashKeyAttributeName]: hashKey,
                [this._config.rangeKeyAttributeName]: deletePointInput.RangeKeyValue,
            },
        }));
    }
}
exports.DynamoDBManager = DynamoDBManager;
