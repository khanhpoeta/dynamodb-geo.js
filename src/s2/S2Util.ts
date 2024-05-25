import { QueryRadiusInput, QueryRectangleInput } from '../types';
import { S2LatLng, S2LatLngRect, Utils } from 'nodes2ts';

export class S2Util {
  public static latLngRectFromQueryRectangleInput(
    geoQueryRequest: QueryRectangleInput,
  ): S2LatLngRect | null {
    const queryRectangleRequest = geoQueryRequest as QueryRectangleInput;

    const minPoint = queryRectangleRequest.MinPoint;
    const maxPoint = queryRectangleRequest.MaxPoint;

    let latLngRect: S2LatLngRect | null = null;

    if (minPoint != null && maxPoint != null) {
      const minLatLng = S2LatLng.fromDegrees(
        minPoint.latitude,
        minPoint.longitude,
      );
      const maxLatLng = S2LatLng.fromDegrees(
        maxPoint.latitude,
        maxPoint.longitude,
      );

      latLngRect = S2LatLngRect.fromLatLng(minLatLng, maxLatLng);
    }

    return latLngRect;
  }

  public static getBoundingLatLngRectFromQueryRadiusInput(
    geoQueryRequest: QueryRadiusInput,
  ): S2LatLngRect {
    const centerPoint = geoQueryRequest.CenterPoint;
    const { latitude, longitude } = centerPoint;
    const radiusInMeter = geoQueryRequest.RadiusInMeter;

    const centerLatLng = S2LatLng.fromDegrees(latitude, longitude);

    const region = Utils.calcRegionFromCenterRadius(
      centerLatLng,
      radiusInMeter / 1000,
    );

    return region.getRectBound();
  }
}
