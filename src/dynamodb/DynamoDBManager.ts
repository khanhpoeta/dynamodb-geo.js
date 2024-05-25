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

import { GeoDataManagerConfiguration } from '../GeoDataManagerConfiguration';
import {
  DeletePointInput,
  GetPointInput,
  PutPointInput,
  UpdatePointInput,
} from '../types';
import { S2Manager } from '../s2/S2Manager';
import { GeohashRange } from '../model/GeohashRange';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  GetCommand,
  GetCommandInput,
  PutCommand,
  BatchWriteCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import Long from 'long';

export class DynamoDBManager {
  _config: GeoDataManagerConfiguration;
  _ddbDocClient: DynamoDBDocumentClient;

  constructor(config: GeoDataManagerConfiguration) {
    this._config = config;
    const marshallOptions = {
      // Whether to automatically convert empty strings, blobs, and sets to `null`.
      // convertEmptyValues: false, // false, by default.
      // Whether to remove undefined values while marshalling.
      removeUndefinedValues: true, // false, by default.
      // Whether to convert typeof object to map attribute.
      convertClassInstanceToMap: true, // false, by default. <---- Set this flag
    };

    const unmarshallOptions = {
      // Whether to return numbers as a string instead of converting them to native JavaScript numbers.
      // wrapNumbers: false, // false, by default.
    };

    const translateConfig = { marshallOptions, unmarshallOptions };
    this._ddbDocClient = DynamoDBDocumentClient.from(
      config.dynamoDBClient,
      translateConfig,
    );
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
  async queryGeohash(
    queryInput: QueryCommandInput | undefined,
    hashKey: Long,
    range: GeohashRange,
  ) {
    const queryOutputs: QueryCommandOutput[] = [];

    const nextQuery = async (lastEvaluatedKey?: Record<string, any>) => {
      const input = { KeyConditions: {} };
      input.KeyConditions[this._config.hashKeyAttributeName] = {
        ComparisonOperator: 'EQ',
        AttributeValueList: [hashKey.toInt()],
      };

      const minRange = range.rangeMin.toInt();
      const maxRange = range.rangeMax.toInt();
      const ranges = [minRange, maxRange];
      console.log('hashKey', hashKey.toInt());
      console.log('range.rangeMax', JSON.stringify(range));
      console.log('ranges', ranges);
      input.KeyConditions[this._config.geohashAttributeName] = {
        ComparisonOperator: 'BETWEEN',
        AttributeValueList: [Math.min(...ranges), Math.max(...ranges)],
      };

      const defaults: QueryCommandInput = {
        TableName: this._config.tableName,
        KeyConditions: input.KeyConditions,
        IndexName: this._config.geohashIndexName,
        ConsistentRead: this._config.consistentRead,
        ReturnConsumedCapacity: 'TOTAL',
        ExclusiveStartKey: lastEvaluatedKey,
      };
      if (
        queryInput?.FilterExpression &&
        queryInput?.ExpressionAttributeValues
      ) {
        defaults.FilterExpression = queryInput.FilterExpression;
        defaults.ExpressionAttributeValues =
          queryInput.ExpressionAttributeValues;
      }

      const queryOutput = await this._ddbDocClient.send(
        new QueryCommand(defaults),
      );
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

  getPoint(getPointInput: GetPointInput) {
    const geohash = S2Manager.generateGeohash(getPointInput.GeoPoint);
    const hashKey = S2Manager.generateHashKey(
      geohash,
      this._config.hashKeyLength,
    );

    const getItemInput = getPointInput.GetItemInput;

    const commandInput: GetCommandInput = {
      TableName: this._config.tableName,
      Key: {
        [this._config.hashKeyAttributeName]: hashKey.toInt(),
        [this._config.rangeKeyAttributeName]: getPointInput.RangeKeyValue,
      },
    };
    if (getItemInput) {
      commandInput.TableName = getItemInput.TableName;
      commandInput.Key = getItemInput.Key;
    }

    return this._ddbDocClient.send(new GetCommand(commandInput));
  }

  putPoint(putPointInput: PutPointInput) {
    const geohash = S2Manager.generateGeohash(putPointInput.GeoPoint);
    const hashKey = S2Manager.generateHashKey(
      geohash,
      this._config.hashKeyLength,
    );
    const item = {
      [this._config.hashKeyAttributeName]: hashKey.toInt(),
      [this._config.rangeKeyAttributeName]: putPointInput.RangeKeyValue,
      [this._config.geohashAttributeName]: geohash.toInt(),
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

    return this._ddbDocClient.send(new PutCommand(putItemParams));
  }

  batchWritePoints(putPointInputs: PutPointInput[]) {
    const RequestItems = {};
    const writeInputs = putPointInputs.map(i => {
      const geohash = S2Manager.generateGeohash(i.GeoPoint);
      const hashKey = S2Manager.generateHashKey(
        geohash,
        this._config.hashKeyLength,
      );
      const putItemInput = i.PutItemInput;

      let Item = {};
      if (putItemInput.Item) {
        Item = putItemInput.Item;
      }
      Item[this._config.hashKeyAttributeName] = hashKey.toInt();
      Item[this._config.rangeKeyAttributeName] = i.RangeKeyValue;
      Item[this._config.geohashAttributeName] = geohash.toInt();
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
    return this._ddbDocClient.send(new BatchWriteCommand({ RequestItems }));
  }

  updatePoint(updatePointInput: UpdatePointInput) {
    const geohash = S2Manager.generateGeohash(updatePointInput.GeoPoint);
    const hashKey = S2Manager.generateHashKey(
      geohash,
      this._config.hashKeyLength,
    );

    updatePointInput.UpdateItemInput.TableName = this._config.tableName;

    if (!updatePointInput.UpdateItemInput.Key) {
      updatePointInput.UpdateItemInput.Key = {};
    }

    updatePointInput.UpdateItemInput.Key[this._config.hashKeyAttributeName] =
      hashKey.toInt();
    updatePointInput.UpdateItemInput.Key[this._config.rangeKeyAttributeName] =
      updatePointInput.RangeKeyValue;

    // Geohash and geoJson cannot be updated.
    if (updatePointInput.UpdateItemInput.AttributeUpdates) {
      delete updatePointInput.UpdateItemInput.AttributeUpdates[
        this._config.geohashAttributeName
      ];
      delete updatePointInput.UpdateItemInput.AttributeUpdates[
        this._config.geoJsonAttributeName
      ];
    }

    return this._ddbDocClient.send(
      new UpdateCommand(updatePointInput.UpdateItemInput),
    );
  }

  deletePoint(deletePointInput: DeletePointInput) {
    const geohash = S2Manager.generateGeohash(deletePointInput.GeoPoint);
    const hashKey = S2Manager.generateHashKey(
      geohash,
      this._config.hashKeyLength,
    );

    return this._config.dynamoDBClient.send(
      new DeleteCommand({
        ...deletePointInput,
        TableName: this._config.tableName,
        Key: {
          [this._config.hashKeyAttributeName]: hashKey.toInt(),
          [this._config.rangeKeyAttributeName]: deletePointInput.RangeKeyValue,
        },
      }),
    );
  }
}
