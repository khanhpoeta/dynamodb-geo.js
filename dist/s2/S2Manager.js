"use strict";
/*
 * Copyright 2010-2013 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 * http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.S2Manager = void 0;
const s2_1 = require("@radarlabs/s2");
class S2Manager {
    static generateGeohash(geoPoint) {
        const s2LatLong = geoPoint;
        const cell = new s2_1.CellId(s2LatLong);
        return cell.id();
    }
    static generateHashKey(geohash, hashKeyLength) {
        if (geohash < 0n) {
            // Counteract "-" at beginning of geohash.
            hashKeyLength++;
        }
        const geohashString = geohash.toString();
        const denominator = 10n ** BigInt(geohashString.length - hashKeyLength);
        return geohash / denominator;
    }
}
exports.S2Manager = S2Manager;
