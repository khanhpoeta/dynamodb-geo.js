"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoDataManager = void 0;
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
const DynamoDBManager_1 = require("./dynamodb/DynamoDBManager");
const S2Manager_1 = require("./s2/S2Manager");
const S2Util_1 = require("./s2/S2Util");
const nodes2ts_1 = require("nodes2ts");
const Covering_1 = require("./model/Covering");
/**
 * <p>
 * Manager to hangle geo spatial data in Amazon DynamoDB tables. All service calls made using this client are blocking,
 * and will not return until the service call completes.
 * </p>
 * <p>
 * This class is designed to be thread safe; however, once constructed GeoDataManagerConfiguration should not be
 * modified. Modifying GeoDataManagerConfiguration may cause unspecified behaviors.
 * </p>
 * */
class GeoDataManager {
    /**
     * <p>
     * Construct and configure GeoDataManager using GeoDataManagerConfiguration.
     * </p>
     * <b>Sample usage:</b>
     *
     * <pre>
     * AmazonDynamoDBClient ddb = new AmazonDynamoDBClient(new ClasspathPropertiesFileCredentialsProvider());
     * Region usWest2 = Region.getRegion(Regions.US_WEST_2);
     * ddb.setRegion(usWest2);
     *
     * ClientConfiguration clientConfiguration = new ClientConfiguration().withMaxErrorRetry(5);
     * ddb.setConfiguration(clientConfiguration);
     *
     * GeoDataManagerConfiguration config = new GeoDataManagerConfiguration(ddb, &quot;geo-table&quot;);
     * GeoDataManager geoDataManager = new GeoDataManager(config);
     * </pre>
     *
     * @param config
     *            Container for the configuration parameters for GeoDataManager.
     */
    constructor(config) {
        this.config = config;
        this.dynamoDBManager = new DynamoDBManager_1.DynamoDBManager(this.config);
    }
    /**
     * <p>
     * Return GeoDataManagerConfiguration. The returned GeoDataManagerConfiguration should not be modified.
     * </p>
     *
     * @return
     *         GeoDataManagerConfiguration that is used to configure this GeoDataManager.
     */
    getGeoDataManagerConfiguration() {
        return this.config;
    }
    /**
     * <p>
     * Put a point into the Amazon DynamoDB table. Once put, you cannot update attributes specified in
     * GeoDataManagerConfiguration: hash key, range key, geohash and geoJson. If you want to update these columns, you
     * need to insert a new record and delete the old record.
     * </p>
     * <b>Sample usage:</b>
     *
     * <pre>
     * GeoPoint geoPoint = new GeoPoint(47.5, -122.3);
     * AttributeValue rangeKeyValue = new AttributeValue().withS(&quot;a6feb446-c7f2-4b48-9b3a-0f87744a5047&quot;);
     * AttributeValue titleValue = new AttributeValue().withS(&quot;Original title&quot;);
     *
     * PutPointRequest putPointRequest = new PutPointRequest(geoPoint, rangeKeyValue);
     * putPointRequest.getPutItemRequest().getItem().put(&quot;title&quot;, titleValue);
     *
     * PutPointResult putPointResult = geoDataManager.putPoint(putPointRequest);
     * </pre>
     *
     * @param putPointInput
     *            Container for the necessary parameters to execute put point request.
     *
     * @return Result of put point request.
     */
    putPoint(putPointInput) {
        return this.dynamoDBManager.putPoint(putPointInput);
    }
    /**
     * <p>
     * Put a list of points into the Amazon DynamoDB table. Once put, you cannot update attributes specified in
     * GeoDataManagerConfiguration: hash key, range key, geohash and geoJson. If you want to update these columns, you
     * need to insert a new record and delete the old record.
     * </p>
     * <b>Sample usage:</b>
     *
     * <pre>
     * GeoPoint geoPoint = new GeoPoint(47.5, -122.3);
     * AttributeValue rangeKeyValue = new AttributeValue().withS(&quot;a6feb446-c7f2-4b48-9b3a-0f87744a5047&quot;);
     * AttributeValue titleValue = new AttributeValue().withS(&quot;Original title&quot;);
     *
     * PutPointRequest putPointRequest = new PutPointRequest(geoPoint, rangeKeyValue);
     * putPointRequest.getPutItemRequest().getItem().put(&quot;title&quot;, titleValue);
     * List<PutPointRequest> putPointRequests = new ArrayList<PutPointRequest>();
     * putPointRequests.add(putPointRequest);
     * BatchWritePointResult batchWritePointResult = geoDataManager.batchWritePoints(putPointRequests);
     * </pre>
     *
     * @param putPointInputs
     *            Container for the necessary parameters to execute put point request.
     *
     * @return Result of batch put point request.
     */
    batchWritePoints(putPointInputs) {
        return this.dynamoDBManager.batchWritePoints(putPointInputs);
    }
    /**
     * <p>
     * Get a point from the Amazon DynamoDB table.
     * </p>
     * <b>Sample usage:</b>
     *
     * <pre>
     * GeoPoint geoPoint = new GeoPoint(47.5, -122.3);
     * AttributeValue rangeKeyValue = new AttributeValue().withS(&quot;a6feb446-c7f2-4b48-9b3a-0f87744a5047&quot;);
     *
     * GetPointRequest getPointRequest = new GetPointRequest(geoPoint, rangeKeyValue);
     * GetPointResult getPointResult = geoIndexManager.getPoint(getPointRequest);
     *
     * System.out.println(&quot;item: &quot; + getPointResult.getGetItemResult().getItem());
     * </pre>
     *
     * @param getPointInput
     *            Container for the necessary parameters to execute get point request.
     *
     * @return Result of get point request.
     * */
    getPoint(getPointInput) {
        return this.dynamoDBManager.getPoint(getPointInput);
    }
    /**
     * <p>
     * Query a rectangular area constructed by two points and return all points within the area. Two points need to
     * construct a rectangle from minimum and maximum latitudes and longitudes. If minPoint.getLongitude() >
     * maxPoint.getLongitude(), the rectangle spans the 180 degree longitude line.
     * </p>
     * <b>Sample usage:</b>
     *
     * <pre>
     * GeoPoint minPoint = new GeoPoint(45.5, -124.3);
     * GeoPoint maxPoint = new GeoPoint(49.5, -120.3);
     *
     * QueryRectangleRequest queryRectangleRequest = new QueryRectangleRequest(minPoint, maxPoint);
     * QueryRectangleResult queryRectangleResult = geoIndexManager.queryRectangle(queryRectangleRequest);
     *
     * for (Map&lt;String, AttributeValue&gt; item : queryRectangleResult.getItem()) {
     * 	System.out.println(&quot;item: &quot; + item);
     * }
     * </pre>
     *
     * @param queryRectangleInput
     *            Container for the necessary parameters to execute rectangle query request.
     *
     * @return Result of rectangle query request.
     */
    async queryRectangle(queryRectangleInput) {
        const latLngRect = S2Util_1.S2Util.latLngRectFromQueryRectangleInput(queryRectangleInput);
        if (latLngRect) {
            const covering = new Covering_1.Covering(new this.config.S2RegionCoverer().getCoveringCells(latLngRect));
            const results = await this.dispatchQueries(covering, queryRectangleInput);
            return this.filterByRectangle(results, queryRectangleInput);
        }
        return [];
    }
    /**
     * <p>
     * Query a circular area constructed by a center point and its radius.
     * </p>
     * <b>Sample usage:</b>
     *
     * <pre>
     * GeoPoint centerPoint = new GeoPoint(47.5, -122.3);
     *
     * QueryRadiusRequest queryRadiusRequest = new QueryRadiusRequest(centerPoint, 100);
     * QueryRadiusResult queryRadiusResult = geoIndexManager.queryRadius(queryRadiusRequest);
     *
     * for (Map&lt;String, AttributeValue&gt; item : queryRadiusResult.getItem()) {
     * 	System.out.println(&quot;item: &quot; + item);
     * }
     * </pre>
     *
     * @param queryRadiusInput
     *            Container for the necessary parameters to execute radius query request.
     *
     * @return Result of radius query request.
     * */
    async queryRadius(queryRadiusInput) {
        const latLngRect = S2Util_1.S2Util.getBoundingLatLngRectFromQueryRadiusInput(queryRadiusInput);
        const covering = new Covering_1.Covering(new this.config.S2RegionCoverer().getCoveringCells(latLngRect));
        const results = await this.dispatchQueries(covering, queryRadiusInput);
        return this.filterByRadius(results, queryRadiusInput);
    }
    /**
     * <p>
     * Update a point data in Amazon DynamoDB table. You cannot update attributes specified in
     * GeoDataManagerConfiguration: hash key, range key, geohash and geoJson. If you want to update these columns, you
     * need to insert a new record and delete the old record.
     * </p>
     * <b>Sample usage:</b>
     *
     * <pre>
     * GeoPoint geoPoint = new GeoPoint(47.5, -122.3);
     *
     * String rangeKey = &quot;a6feb446-c7f2-4b48-9b3a-0f87744a5047&quot;;
     * AttributeValue rangeKeyValue = new AttributeValue().withS(rangeKey);
     *
     * UpdatePointRequest updatePointRequest = new UpdatePointRequest(geoPoint, rangeKeyValue);
     *
     * AttributeValue titleValue = new AttributeValue().withS(&quot;Updated title.&quot;);
     * AttributeValueUpdate titleValueUpdate = new AttributeValueUpdate().withAction(AttributeAction.PUT)
     *    .withValue(titleValue);
     * updatePointRequest.getUpdateItemRequest().getAttributeUpdates().put(&quot;title&quot;, titleValueUpdate);
     *
     * UpdatePointResult updatePointResult = geoIndexManager.updatePoint(updatePointRequest);
     * </pre>
     *
     * @param updatePointInput
     *            Container for the necessary parameters to execute update point request.
     *
     * @return Result of update point request.
     */
    updatePoint(updatePointInput) {
        return this.dynamoDBManager.updatePoint(updatePointInput);
    }
    /**
     * <p>
     * Delete a point from the Amazon DynamoDB table.
     * </p>
     * <b>Sample usage:</b>
     *
     * <pre>
     * GeoPoint geoPoint = new GeoPoint(47.5, -122.3);
     *
     * String rangeKey = &quot;a6feb446-c7f2-4b48-9b3a-0f87744a5047&quot;;
     * AttributeValue rangeKeyValue = new AttributeValue().withS(rangeKey);
     *
     * DeletePointRequest deletePointRequest = new DeletePointRequest(geoPoint, rangeKeyValue);
     * DeletePointResult deletePointResult = geoIndexManager.deletePoint(deletePointRequest);
     * </pre>
     *
     * @param deletePointInput
     *            Container for the necessary parameters to execute delete point request.
     *
     * @return Result of delete point request.
     */
    deletePoint(deletePointInput) {
        return this.dynamoDBManager.deletePoint(deletePointInput);
    }
    /**
     * Query Amazon DynamoDB in parallel and filter the result.
     *
     * @param covering
     *            A list of geohash ranges that will be used to query Amazon DynamoDB.
     *
     * @param geoQueryInput
     *            The rectangle area that will be used as a reference point for precise filtering.
     *
     * @return Aggregated and filtered items returned from Amazon DynamoDB.
     */
    async dispatchQueries(covering, geoQueryInput) {
        const promises = covering
            .getGeoHashRanges(this.config.hashKeyLength)
            .map(range => {
            const hashKey = S2Manager_1.S2Manager.generateHashKey(range.rangeMin, this.config.hashKeyLength);
            return this.dynamoDBManager.queryGeohash(geoQueryInput.QueryInput, hashKey, range);
        });
        const results = await Promise.all(promises);
        const mergedResults = [];
        results.forEach(queryOutputs => queryOutputs.forEach(queryOutput => {
            if (queryOutput.Items) {
                mergedResults.push(...queryOutput.Items);
            }
        }));
        return mergedResults;
    }
    /**
     * Filter out any points outside of the queried area from the input list.
     *
     * @param list
     * @param geoQueryInput
     * @returns DynamoDB.ItemList
     */
    filterByRadius(list, geoQueryInput) {
        let radiusInMeter = 0;
        const centerPoint = geoQueryInput
            .CenterPoint;
        const centerLatLng = nodes2ts_1.S2LatLng.fromDegrees(centerPoint.latitude, centerPoint.longitude);
        radiusInMeter = geoQueryInput.RadiusInMeter;
        return list.filter(item => {
            const geoJson = item[this.config.geoJsonAttributeName].S;
            const coordinates = JSON.parse(geoJson).coordinates;
            const longitude = coordinates[this.config.longitudeFirst ? 0 : 1];
            const latitude = coordinates[this.config.longitudeFirst ? 1 : 0];
            const latLng = nodes2ts_1.S2LatLng.fromDegrees(latitude, longitude);
            return centerLatLng.getEarthDistance(latLng) <= radiusInMeter;
        });
    }
    /**
     * Filter out any points outside of the queried area from the input list.
     *
     * @param list
     * @param geoQueryInput
     * @returns DynamoDB.ItemList
     */
    filterByRectangle(list, geoQueryInput) {
        const latLngRect = S2Util_1.S2Util.latLngRectFromQueryRectangleInput(geoQueryInput);
        if (latLngRect) {
            return list.filter(item => {
                const geoJson = item[this.config.geoJsonAttributeName].S;
                const coordinates = JSON.parse(geoJson).coordinates;
                const longitude = coordinates[this.config.longitudeFirst ? 0 : 1];
                const latitude = coordinates[this.config.longitudeFirst ? 1 : 0];
                const latLng = nodes2ts_1.S2LatLng.fromDegrees(latitude, longitude);
                return latLngRect.containsLL(latLng);
            });
        }
        return [];
    }
}
exports.GeoDataManager = GeoDataManager;
