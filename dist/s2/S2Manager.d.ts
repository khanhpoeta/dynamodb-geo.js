import { GeoPoint } from '../types';
import Long from 'long';
export declare class S2Manager {
    static generateGeohash(geoPoint: GeoPoint): Long;
    static generateHashKey(geohash: Long, hashKeyLength: number): Long;
}
