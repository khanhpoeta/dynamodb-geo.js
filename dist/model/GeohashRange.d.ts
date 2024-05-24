export declare class GeohashRange {
    rangeMin: bigint;
    rangeMax: bigint;
    constructor(min: bigint | number, max: bigint | number);
    tryMerge(range: GeohashRange): boolean;
    trySplit(hashKeyLength: number): GeohashRange[];
}
