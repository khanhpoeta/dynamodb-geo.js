import { GeoDataManagerConfiguration } from '../GeoDataManagerConfiguration';
import { S2Manager } from '../s2/S2Manager';

export class GeohashRange {
  rangeMin: bigint;
  rangeMax: bigint;

  constructor(min: bigint | number, max: bigint | number) {
    this.rangeMin = typeof min === 'bigint' ? min : BigInt(min);
    this.rangeMax = typeof max === 'bigint' ? max : BigInt(max);
  }

  public tryMerge(range: GeohashRange): boolean {
    const mergeThreshold = BigInt(GeoDataManagerConfiguration.MERGE_THRESHOLD);

    if (
      this.rangeMax - range.rangeMin <= mergeThreshold &&
      range.rangeMin > this.rangeMax
    ) {
      this.rangeMax = range.rangeMax;
      return true;
    }

    if (
      this.rangeMin - range.rangeMax <= mergeThreshold &&
      this.rangeMin > range.rangeMax
    ) {
      this.rangeMin = range.rangeMin;
      return true;
    }

    return false;
  }

  /*
   * Try to split the range to multiple ranges based on the hash key.
   *
   * e.g., for the following range:
   *
   * min: 123456789
   * max: 125678912
   *
   * when the hash key length is 3, we want to split the range to:
   *
   * 1
   * min: 123456789
   * max: 123999999
   *
   * 2
   * min: 124000000
   * max: 124999999
   *
   * 3
   * min: 125000000
   * max: 125678912
   *
   * For this range:
   *
   * min: -125678912
   * max: -123456789
   *
   * we want:
   *
   * 1
   * min: -125678912
   * max: -125000000
   *
   * 2
   * min: -124999999
   * max: -124000000
   *
   * 3
   * min: -123999999
   * max: -123456789
   */
  public trySplit(hashKeyLength: number): GeohashRange[] {
    const result: GeohashRange[] = [];

    const minHashKey = S2Manager.generateHashKey(this.rangeMin, hashKeyLength);
    const maxHashKey = S2Manager.generateHashKey(this.rangeMax, hashKeyLength);

    const denominator =
      10n **
      BigInt(this.rangeMin.toString().length - minHashKey.toString().length);

    if (minHashKey === maxHashKey) {
      result.push(this);
    } else {
      for (let l = minHashKey; l <= maxHashKey; l += 1n) {
        if (l > 0n) {
          result.push(
            new GeohashRange(
              l === minHashKey ? this.rangeMin : l * denominator,
              l === maxHashKey ? this.rangeMax : (l + 1n) * denominator - 1n,
            ),
          );
        } else {
          result.push(
            new GeohashRange(
              l === minHashKey ? this.rangeMin : (l - 1n) * denominator + 1n,
              l === maxHashKey ? this.rangeMax : l * denominator,
            ),
          );
        }
      }
    }

    return result;
  }
}
