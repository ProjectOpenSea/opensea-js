"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ZONE_BY_NETWORK = exports.WETH_ADDRESS_BY_NETWORK = exports.CONDUIT_KEYS_TO_CONDUIT = exports.CROSS_CHAIN_DEFAULT_CONDUIT_KEY = exports.MERKLE_VALIDATOR_RINKEBY = exports.MERKLE_VALIDATOR_MAINNET = exports.EIP_712_WYVERN_DOMAIN_VERSION = exports.EIP_712_WYVERN_DOMAIN_NAME = exports.EIP_712_ORDER_TYPES = exports.API_PATH = exports.ORDERBOOK_PATH = exports.TESTNET_PROVIDER_URL = exports.MAINNET_PROVIDER_URL = exports.RPC_URL_PATH = exports.API_BASE_TESTNET = exports.API_BASE_MAINNET = exports.ORDER_MATCHING_LATENCY_SECONDS = exports.MAX_EXPIRATION_MONTHS = exports.MIN_EXPIRATION_MINUTES = exports.DEFAULT_MAX_BOUNTY = exports.OPENSEA_SELLER_BOUNTY_BASIS_POINTS = exports.DEFAULT_SELLER_FEE_BASIS_POINTS = exports.DEFAULT_BUYER_FEE_BASIS_POINTS = exports.DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS = exports.UNISWAP_FACTORY_ADDRESS_RINKEBY = exports.UNISWAP_FACTORY_ADDRESS_MAINNET = exports.WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY = exports.WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET = exports.WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY = exports.WRAPPED_NFT_FACTORY_ADDRESS_MAINNET = exports.TESTNET_ASSET_ADDRESS = exports.CK_ADDRESS = exports.ENJIN_LEGACY_ADDRESS = exports.ENJIN_ADDRESS = exports.MANA_ADDRESS = exports.ENJIN_COIN_ADDRESS = exports.SHARED_STORE_FRONT_ADDRESS_RINKEBY = exports.SHARED_STORE_FRONT_ADDRESS_MAINNET = exports.SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS = exports.MAX_UINT_256 = exports.INVERSE_BASIS_POINT = exports.OPENSEA_FEE_RECIPIENT = exports.OPENSEA_LEGACY_FEE_RECIPIENT = exports.NULL_BLOCK_HASH = exports.NULL_ADDRESS = exports.DEFAULT_GAS_INCREASE_FACTOR = void 0;
var wyvern_js_1 = require("wyvern-js");
var types_1 = require("./types");
exports.DEFAULT_GAS_INCREASE_FACTOR = 1.01;
exports.NULL_ADDRESS = wyvern_js_1.WyvernProtocol.NULL_ADDRESS;
exports.NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
exports.OPENSEA_LEGACY_FEE_RECIPIENT = "0x5b3256965e7c3cf26e11fcaf296dfc8807c01073";
exports.OPENSEA_FEE_RECIPIENT = "0x0000a26b00c1f0df003000390027140000faa719";
exports.INVERSE_BASIS_POINT = 10000; // 100 basis points per 1%
exports.MAX_UINT_256 = wyvern_js_1.WyvernProtocol.MAX_UINT_256;
exports.SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS = "0xa604060890923ff400e8c6f5290461a83aedacec"; // Same address on mainnet and Rinkeby
exports.SHARED_STORE_FRONT_ADDRESS_MAINNET = "0x495f947276749ce646f68ac8c248420045cb7b5e";
exports.SHARED_STORE_FRONT_ADDRESS_RINKEBY = "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656";
exports.ENJIN_COIN_ADDRESS = "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c";
exports.MANA_ADDRESS = "0x0f5d2fb29fb7d3cfee444a200298f468908cc942";
exports.ENJIN_ADDRESS = "0xfaaFDc07907ff5120a76b34b731b278c38d6043C";
exports.ENJIN_LEGACY_ADDRESS = "0x8562c38485B1E8cCd82E44F89823dA76C98eb0Ab";
exports.CK_ADDRESS = "0x06012c8cf97bead5deae237070f9587f8e7a266d";
exports.TESTNET_ASSET_ADDRESS = "0x57b470074beb3c60f0cf94f8aafb3fd6342adccd";
exports.WRAPPED_NFT_FACTORY_ADDRESS_MAINNET = "0xf11b5815b143472b7f7c52af0bfa6c6a2c8f40e1";
exports.WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY = "0x94c71c87244b862cfd64d36af468309e4804ec09";
exports.WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET = "0x995835145dd85c012f3e2d7d5561abd626658c04";
exports.WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY = "0xaa775Eb452353aB17f7cf182915667c2598D43d3";
exports.UNISWAP_FACTORY_ADDRESS_MAINNET = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95";
exports.UNISWAP_FACTORY_ADDRESS_RINKEBY = "0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36";
exports.DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS = 1000;
exports.DEFAULT_BUYER_FEE_BASIS_POINTS = 0;
exports.DEFAULT_SELLER_FEE_BASIS_POINTS = 250;
exports.OPENSEA_SELLER_BOUNTY_BASIS_POINTS = 100;
exports.DEFAULT_MAX_BOUNTY = exports.DEFAULT_SELLER_FEE_BASIS_POINTS;
exports.MIN_EXPIRATION_MINUTES = 15;
exports.MAX_EXPIRATION_MONTHS = 3;
exports.ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7;
var ORDERBOOK_VERSION = 1;
exports.API_BASE_MAINNET = "https://api.opensea.io";
exports.API_BASE_TESTNET = "https://testnets-api.opensea.io";
exports.RPC_URL_PATH = "jsonrpc/v1/";
exports.MAINNET_PROVIDER_URL = "".concat(exports.API_BASE_MAINNET, "/").concat(exports.RPC_URL_PATH);
exports.TESTNET_PROVIDER_URL = "".concat(exports.API_BASE_TESTNET, "/").concat(exports.RPC_URL_PATH);
exports.ORDERBOOK_PATH = "/wyvern/v".concat(ORDERBOOK_VERSION);
exports.API_PATH = "/api/v".concat(ORDERBOOK_VERSION);
exports.EIP_712_ORDER_TYPES = {
    EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
    ],
    Order: [
        { name: "exchange", type: "address" },
        { name: "maker", type: "address" },
        { name: "taker", type: "address" },
        { name: "makerRelayerFee", type: "uint256" },
        { name: "takerRelayerFee", type: "uint256" },
        { name: "makerProtocolFee", type: "uint256" },
        { name: "takerProtocolFee", type: "uint256" },
        { name: "feeRecipient", type: "address" },
        { name: "feeMethod", type: "uint8" },
        { name: "side", type: "uint8" },
        { name: "saleKind", type: "uint8" },
        { name: "target", type: "address" },
        { name: "howToCall", type: "uint8" },
        { name: "calldata", type: "bytes" },
        { name: "replacementPattern", type: "bytes" },
        { name: "staticTarget", type: "address" },
        { name: "staticExtradata", type: "bytes" },
        { name: "paymentToken", type: "address" },
        { name: "basePrice", type: "uint256" },
        { name: "extra", type: "uint256" },
        { name: "listingTime", type: "uint256" },
        { name: "expirationTime", type: "uint256" },
        { name: "salt", type: "uint256" },
        { name: "nonce", type: "uint256" },
    ],
};
exports.EIP_712_WYVERN_DOMAIN_NAME = "Wyvern Exchange Contract";
exports.EIP_712_WYVERN_DOMAIN_VERSION = "2.3";
exports.MERKLE_VALIDATOR_MAINNET = "0xbaf2127b49fc93cbca6269fade0f7f31df4c88a7";
exports.MERKLE_VALIDATOR_RINKEBY = "0x45b594792a5cdc008d0de1c1d69faa3d16b3ddc1";
exports.CROSS_CHAIN_DEFAULT_CONDUIT_KEY = "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000";
var CROSS_CHAIN_DEFAULT_CONDUIT = "0x1e0049783f008a0085193e00003d00cd54003c71";
exports.CONDUIT_KEYS_TO_CONDUIT = (_a = {},
    _a[exports.CROSS_CHAIN_DEFAULT_CONDUIT_KEY] = CROSS_CHAIN_DEFAULT_CONDUIT,
    _a);
exports.WETH_ADDRESS_BY_NETWORK = (_b = {},
    _b[types_1.Network.Main] = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    _b[types_1.Network.Rinkeby] = "0xc778417e063141139fce010982780140aa0cd5ab",
    _b[types_1.Network.Goerli] = "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
    _b);
exports.DEFAULT_ZONE_BY_NETWORK = (_c = {},
    _c[types_1.Network.Main] = "0x004c00500000ad104d7dbd00e3ae0a5c00560c00",
    _c[types_1.Network.Rinkeby] = "0x00000000e88fe2628ebc5da81d2b3cead633e89e",
    _c[types_1.Network.Goerli] = "0x0000000000000000000000000000000000000000",
    _c);
//# sourceMappingURL=constants.js.map