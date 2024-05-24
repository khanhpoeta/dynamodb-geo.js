"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S2Util = void 0;
const s2_1 = __importDefault(require("@radarlabs/s2"));
class S2Util {
    static latLngRectFromQueryRectangleInput(geoQueryRequest) {
        const queryRectangleRequest = geoQueryRequest;
        const minPoint = queryRectangleRequest.MinPoint;
        const maxPoint = queryRectangleRequest.MaxPoint;
        return new s2_1.default.Polyline([minPoint, maxPoint]);
    }
}
exports.S2Util = S2Util;
