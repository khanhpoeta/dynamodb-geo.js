import { GeoDataManagerConfiguration } from '../GeoDataManagerConfiguration';
import { DeletePointInput, GetPointInput, PutPointInput, UpdatePointInput } from '../types';
import { GeohashRange } from '../model/GeohashRange';
import { DynamoDBDocumentClient, QueryCommandInput, QueryCommandOutput } from '@aws-sdk/lib-dynamodb';
import Long from 'long';
export declare class DynamoDBManager {
    _config: GeoDataManagerConfiguration;
    _ddbDocClient: DynamoDBDocumentClient;
    constructor(config: GeoDataManagerConfiguration);
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
    queryGeohash(queryInput: QueryCommandInput | undefined, hashKey: Long, range: GeohashRange): Promise<QueryCommandOutput[]>;
    getPoint(getPointInput: GetPointInput): Promise<import("@aws-sdk/lib-dynamodb").GetCommandOutput>;
    putPoint(putPointInput: PutPointInput): Promise<import("@aws-sdk/lib-dynamodb").PutCommandOutput>;
    batchWritePoints(putPointInputs: PutPointInput[]): Promise<PromiseSettledResult<Omit<import("@aws-sdk/client-dynamodb").TransactWriteItemsCommandOutput, "ItemCollectionMetrics"> & {
        ItemCollectionMetrics?: Record<string, (Omit<import("@aws-sdk/client-dynamodb").ItemCollectionMetrics, "ItemCollectionKey"> & {
            ItemCollectionKey?: Record<string, any> | undefined;
        })[]> | undefined;
    }>[]>;
    updatePoint(updatePointInput: UpdatePointInput): Promise<import("@aws-sdk/lib-dynamodb").UpdateCommandOutput>;
    deletePoint(deletePointInput: DeletePointInput): Promise<import("@aws-sdk/lib-dynamodb").DeleteCommandOutput>;
}
