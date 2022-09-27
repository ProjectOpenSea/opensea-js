export declare const DEFAULT_GAS_INCREASE_FACTOR = 1.01;
export declare const NULL_ADDRESS: string;
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const OPENSEA_LEGACY_FEE_RECIPIENT = "0x5b3256965e7c3cf26e11fcaf296dfc8807c01073";
export declare const OPENSEA_FEE_RECIPIENT = "0x0000a26b00c1f0df003000390027140000faa719";
export declare const INVERSE_BASIS_POINT = 10000;
export declare const MAX_UINT_256: import("bignumber.js").default;
export declare const SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS = "0xa604060890923ff400e8c6f5290461a83aedacec";
export declare const SHARED_STORE_FRONT_ADDRESS_MAINNET = "0x495f947276749ce646f68ac8c248420045cb7b5e";
export declare const SHARED_STORE_FRONT_ADDRESS_RINKEBY = "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656";
export declare const ENJIN_COIN_ADDRESS = "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c";
export declare const MANA_ADDRESS = "0x0f5d2fb29fb7d3cfee444a200298f468908cc942";
export declare const ENJIN_ADDRESS = "0xfaaFDc07907ff5120a76b34b731b278c38d6043C";
export declare const ENJIN_LEGACY_ADDRESS = "0x8562c38485B1E8cCd82E44F89823dA76C98eb0Ab";
export declare const CK_ADDRESS = "0x06012c8cf97bead5deae237070f9587f8e7a266d";
export declare const TESTNET_ASSET_ADDRESS = "0x57b470074beb3c60f0cf94f8aafb3fd6342adccd";
export declare const WRAPPED_NFT_FACTORY_ADDRESS_MAINNET = "0xf11b5815b143472b7f7c52af0bfa6c6a2c8f40e1";
export declare const WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY = "0x94c71c87244b862cfd64d36af468309e4804ec09";
export declare const WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET = "0x995835145dd85c012f3e2d7d5561abd626658c04";
export declare const WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY = "0xaa775Eb452353aB17f7cf182915667c2598D43d3";
export declare const UNISWAP_FACTORY_ADDRESS_MAINNET = "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95";
export declare const UNISWAP_FACTORY_ADDRESS_RINKEBY = "0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36";
export declare const DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS = 1000;
export declare const DEFAULT_BUYER_FEE_BASIS_POINTS = 0;
export declare const DEFAULT_SELLER_FEE_BASIS_POINTS = 250;
export declare const OPENSEA_SELLER_BOUNTY_BASIS_POINTS = 100;
export declare const DEFAULT_MAX_BOUNTY = 250;
export declare const MIN_EXPIRATION_MINUTES = 15;
export declare const MAX_EXPIRATION_MONTHS = 3;
export declare const ORDER_MATCHING_LATENCY_SECONDS: number;
export declare const API_BASE_MAINNET = "https://api.opensea.io";
export declare const API_BASE_TESTNET = "https://testnets-api.opensea.io";
export declare const RPC_URL_PATH = "jsonrpc/v1/";
export declare const MAINNET_PROVIDER_URL: string;
export declare const TESTNET_PROVIDER_URL: string;
export declare const ORDERBOOK_PATH: string;
export declare const API_PATH: string;
export declare const EIP_712_ORDER_TYPES: {
    EIP712Domain: {
        name: string;
        type: string;
    }[];
    Order: {
        name: string;
        type: string;
    }[];
};
export declare const EIP_712_WYVERN_DOMAIN_NAME = "Wyvern Exchange Contract";
export declare const EIP_712_WYVERN_DOMAIN_VERSION = "2.3";
export declare const MERKLE_VALIDATOR_MAINNET = "0xbaf2127b49fc93cbca6269fade0f7f31df4c88a7";
export declare const MERKLE_VALIDATOR_RINKEBY = "0x45b594792a5cdc008d0de1c1d69faa3d16b3ddc1";
export declare const CROSS_CHAIN_DEFAULT_CONDUIT_KEY = "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000";
export declare const CONDUIT_KEYS_TO_CONDUIT: {
    "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000": string;
};
export declare const WETH_ADDRESS_BY_NETWORK: {
    readonly main: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    readonly rinkeby: "0xc778417e063141139fce010982780140aa0cd5ab";
    readonly goerli: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6";
};
export declare const DEFAULT_ZONE_BY_NETWORK: {
    readonly main: "0x004c00500000ad104d7dbd00e3ae0a5c00560c00";
    readonly rinkeby: "0x00000000e88fe2628ebc5da81d2b3cead633e89e";
    readonly goerli: "0x0000000000000000000000000000000000000000";
};
