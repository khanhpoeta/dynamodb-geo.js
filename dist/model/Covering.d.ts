import { CellId } from '@radarlabs/s2';
import { GeohashRange } from './GeohashRange';
export declare class Covering {
    private cellIds;
    constructor(cellIds: CellId[]);
    getGeoHashRanges(hashKeyLength: number): GeohashRange[];
    getNumberOfCells(): number;
}
