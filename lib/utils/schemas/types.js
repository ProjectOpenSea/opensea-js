"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateMutability = exports.FunctionOutputKind = exports.FunctionInputKind = exports.AbiType = exports.EventInputKind = void 0;
var types_1 = require("../../types");
Object.defineProperty(exports, "AbiType", { enumerable: true, get: function () { return types_1.AbiType; } });
Object.defineProperty(exports, "FunctionInputKind", { enumerable: true, get: function () { return types_1.FunctionInputKind; } });
Object.defineProperty(exports, "FunctionOutputKind", { enumerable: true, get: function () { return types_1.FunctionOutputKind; } });
Object.defineProperty(exports, "StateMutability", { enumerable: true, get: function () { return types_1.StateMutability; } });
var EventInputKind;
(function (EventInputKind) {
    EventInputKind["Source"] = "source";
    EventInputKind["Destination"] = "destination";
    EventInputKind["Asset"] = "asset";
    EventInputKind["Other"] = "other";
})(EventInputKind = exports.EventInputKind || (exports.EventInputKind = {}));
//# sourceMappingURL=types.js.map