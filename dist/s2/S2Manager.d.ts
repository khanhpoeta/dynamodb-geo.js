import { GeoPoint } from '../types';
export declare class S2Manager {
    static generateGeohash(geoPoint: GeoPoint): bigint;
    static generateHashKey(geohash: bigint, hashKeyLength: number): bigint;
}
