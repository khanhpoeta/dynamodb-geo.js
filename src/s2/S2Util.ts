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

    // Reference points for distance calculations
    const latReferenceLatLng = S2LatLng.fromDegrees(latitude + 1.0, longitude);
    const lngReferenceLatLng = S2LatLng.fromDegrees(latitude, longitude + 1.0);

    // Calculate distances
    const latDistance = centerLatLng.getEarthDistance(latReferenceLatLng);
    const lngDistance = centerLatLng.getEarthDistance(lngReferenceLatLng);

    // Calculate the latitude and longitude span
    const latSpan = radiusInMeter / latDistance;
    const lngSpan = radiusInMeter / lngDistance;

    // Determine min and max latitudes and longitudes
    const minLatLng = S2LatLng.fromDegrees(
      latitude - latSpan,
      longitude - lngSpan,
    );
    const maxLatLng = S2LatLng.fromDegrees(
      latitude + latSpan,
      longitude + lngSpan,
    );

    const region = Utils.calcRegionFromCenterRadius(
      centerLatLng,
      geoQueryRequest.RadiusInMeter / 1000,
    );
    const rectBound = region.getRectBound();
    const rect = S2LatLngRect.fromLatLng(minLatLng, maxLatLng);
    console.info('rectBound', rectBound);
    console.info('rect', rect);
    return rect;
  }
}
