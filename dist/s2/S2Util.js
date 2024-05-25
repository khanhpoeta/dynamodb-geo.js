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
        const region = nodes2ts_1.Utils.calcRegionFromCenterRadius(centerLatLng, radiusInMeter / 1000);
        return region.getRectBound();
    }
}
exports.S2Util = S2Util;
