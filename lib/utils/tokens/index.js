"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokens = exports.getCanonicalWrappedEther = void 0;
var goerli_1 = require("./goerli");
var main_1 = require("./main");
var rinkeby_1 = require("./rinkeby");
var types_1 = require("../../types");
var getCanonicalWrappedEther = function (network) {
    switch (network) {
        case types_1.Network.Main:
            return tokens.main.canonicalWrappedEther;
        case types_1.Network.Goerli:
            return tokens.goerli.canonicalWrappedEther;
        case types_1.Network.Rinkeby:
            return tokens.rinkeby.canonicalWrappedEther;
    }
};
exports.getCanonicalWrappedEther = getCanonicalWrappedEther;
var getTokens = function (network) {
    switch (network) {
        case types_1.Network.Main:
            return tokens.main;
        case types_1.Network.Goerli:
            return tokens.goerli;
        case types_1.Network.Rinkeby:
            return tokens.rinkeby;
    }
};
exports.getTokens = getTokens;
var tokens = {
    goerli: goerli_1.tokens,
    rinkeby: rinkeby_1.tokens,
    main: main_1.tokens,
};
//# sourceMappingURL=index.js.map