import { QueryRectangleInput } from '../types';
import S2 from '@radarlabs/s2';
export declare class S2Util {
    static latLngRectFromQueryRectangleInput(geoQueryRequest: QueryRectangleInput): S2.Polyline;
}
