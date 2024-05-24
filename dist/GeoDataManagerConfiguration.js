"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoDataManagerConfiguration = void 0;
/*
 * Copyright 2010-2013 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
const nodes2ts_1 = require("nodes2ts");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
class GeoDataManagerConfiguration {
    constructor(tableName, dynamoDBClient = new client_dynamodb_1.DynamoDBClient({})) {
        this.consistentRead = false;
        this.hashKeyAttributeName = 'hashKey';
        this.rangeKeyAttributeName = 'rangeKey';
        this.geohashAttributeName = 'geohash';
        this.geoJsonAttributeName = 'geoJson';
        this.geohashIndexName = 'geohash-index';
        this.hashKeyLength = 2;
        /**
         * The order of the GeoJSON coordinate pair in data.
         * Use false [lat, lon] for compatibility with the Java library https://github.com/awslabs/dynamodb-geo
         * Use true [lon, lat] for GeoJSON standard compliance. (default)
         *
         * Note that this value should match the state of your existing data - if you change it you must update your database manually
         *
         * @type {boolean}
         */
        this.longitudeFirst = true;
        /**
         * The value of the 'type' attribute in recorded GeoJSON points. Should normally be 'Point', which is standards compliant.
         *
         * Use 'POINT' for compatibility with the Java library https://github.com/awslabs/dynamodb-geo
         *
         * This setting is only relevant for writes. This library doesn't inspect or set this value when reading/querying.
         *
         * @type {string}
         */
        this.geoJsonPointType = 'Point';
        this.dynamoDBClient = dynamoDBClient;
        this.tableName = tableName;
        this.S2RegionCoverer = nodes2ts_1.S2RegionCoverer;
    }
}
exports.GeoDataManagerConfiguration = GeoDataManagerConfiguration;
// Public constants
GeoDataManagerConfiguration.MERGE_THRESHOLD = 2;
