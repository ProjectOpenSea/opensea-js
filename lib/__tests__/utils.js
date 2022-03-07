"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areTimestampsNearlyEqual = void 0;
var areTimestampsNearlyEqual = function (timestampA, timestampB, buffer) {
    if (buffer === void 0) { buffer = 5; }
    return Math.abs(timestampA - timestampB) <= buffer;
};
exports.areTimestampsNearlyEqual = areTimestampsNearlyEqual;
//# sourceMappingURL=utils.js.map