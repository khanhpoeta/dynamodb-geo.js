"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoPoint = void 0;
const s2_1 = __importDefault(require("@radarlabs/s2"));
class GeoPoint extends s2_1.default.LatLng {
}
exports.GeoPoint = GeoPoint;
