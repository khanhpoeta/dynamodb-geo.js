"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S2Util = void 0;
const nodes2ts_1 = require("nodes2ts");
class S2Util {
    static latLngRectFromQueryRectangleInput(geoQueryRequest) {
        const queryRectangleRequest = geoQueryRequest;
        const minPoint = queryRectangleRequest.MinPoint;
        const maxPoint = queryRectangleRequest.MaxPoint;
        let latLngRect = null;
        if (minPoint != null && maxPoint != null) {
            const minLatLng = nodes2ts_1.S2LatLng.fromDegrees(minPoint.latitude, minPoint.longitude);
            const maxLatLng = nodes2ts_1.S2LatLng.fromDegrees(maxPoint.latitude, maxPoint.longitude);
            latLngRect = nodes2ts_1.S2LatLngRect.fromLatLng(minLatLng, maxLatLng);
        }
        return latLngRect;
    }
    static getBoundingLatLngRectFromQueryRadiusInput(geoQueryRequest) {
        const centerPoint = geoQueryRequest.CenterPoint;
        const { latitude, longitude } = centerPoint;
        const radiusInMeter = geoQueryRequest.RadiusInMeter;
        const centerLatLng = nodes2ts_1.S2LatLng.fromDegrees(latitude, longitude);
        // Reference points for distance calculations
        const latReferenceLatLng = nodes2ts_1.S2LatLng.fromDegrees(latitude + 1.0, longitude);
        const lngReferenceLatLng = nodes2ts_1.S2LatLng.fromDegrees(latitude, longitude + 1.0);
        // Calculate distances
        const latDistance = centerLatLng.getEarthDistance(latReferenceLatLng);
        const lngDistance = centerLatLng.getEarthDistance(lngReferenceLatLng);
        // Calculate the latitude and longitude span
        const latSpan = radiusInMeter / latDistance;
        const lngSpan = radiusInMeter / lngDistance;
        // Determine min and max latitudes and longitudes
        const minLatLng = nodes2ts_1.S2LatLng.fromDegrees(latitude - latSpan, longitude - lngSpan);
        const maxLatLng = nodes2ts_1.S2LatLng.fromDegrees(latitude + latSpan, longitude + lngSpan);
        return nodes2ts_1.S2LatLngRect.fromLatLng(minLatLng, maxLatLng);
    }
}
exports.S2Util = S2Util;
