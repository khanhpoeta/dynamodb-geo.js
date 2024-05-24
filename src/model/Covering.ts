import { CellId } from '@radarlabs/s2';
import { GeohashRange } from './GeohashRange';

export class Covering {
  private cellIds: CellId[];

  constructor(cellIds: CellId[]) {
    this.cellIds = cellIds;
  }

  public getGeoHashRanges(hashKeyLength: number) {
    const ranges: GeohashRange[] = [];
    this.cellIds.forEach(outerRange => {
      const hashRange = new GeohashRange(
        outerRange.rangeMin().id(),
        outerRange.rangeMax().id(),
      );
      ranges.push(...hashRange.trySplit(hashKeyLength));
    });
    return ranges;
  }

  public getNumberOfCells() {
    return this.cellIds.length;
  }
}
