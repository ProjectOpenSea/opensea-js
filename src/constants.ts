import { WyvernProtocol } from "wyvern-js";
import { Network } from "./types";

export const DEFAULT_GAS_INCREASE_FACTOR = 1.01;
export const NULL_ADDRESS = WyvernProtocol.NULL_ADDRESS;
export const NULL_BLOCK_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const OPENSEA_LEGACY_FEE_RECIPIENT =
  "0x5b3256965e7c3cf26e11fcaf296dfc8807c01073";
export const OPENSEA_FEE_RECIPIENT =
  "0x8de9c5a032463c561423387a9648c5c7bcc5bc90";
export const INVERSE_BASIS_POINT = 10_000; // 100 basis points per 1%
export const MAX_UINT_256 = WyvernProtocol.MAX_UINT_256;
export const SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS =
  "0xa604060890923ff400e8c6f5290461a83aedacec"; // Same address on mainnet and Rinkeby
export const SHARED_STORE_FRONT_ADDRESS_MAINNET =
  "0x495f947276749ce646f68ac8c248420045cb7b5e";
export const SHARED_STORE_FRONT_ADDRESS_RINKEBY =
  "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656";
export const ENJIN_COIN_ADDRESS = "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c";
export const MANA_ADDRESS = "0x0f5d2fb29fb7d3cfee444a200298f468908cc942";
export const ENJIN_ADDRESS = "0xfaaFDc07907ff5120a76b34b731b278c38d6043C";
export const ENJIN_LEGACY_ADDRESS =
  "0x8562c38485B1E8cCd82E44F89823dA76C98eb0Ab";
export const CK_ADDRESS = "0x06012c8cf97bead5deae237070f9587f8e7a266d";
export const CK_RINKEBY_ADDRESS = "0x16baf0de678e52367adc69fd067e5edd1d33e3bf";
export const WRAPPED_NFT_FACTORY_ADDRESS_MAINNET =
  "0xf11b5815b143472b7f7c52af0bfa6c6a2c8f40e1";
export const WRAPPED_NFT_FACTORY_ADDRESS_RINKEBY =
  "0x94c71c87244b862cfd64d36af468309e4804ec09";
export const WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_MAINNET =
  "0x995835145dd85c012f3e2d7d5561abd626658c04";
export const WRAPPED_NFT_LIQUIDATION_PROXY_ADDRESS_RINKEBY =
  "0xaa775Eb452353aB17f7cf182915667c2598D43d3";
export const UNISWAP_FACTORY_ADDRESS_MAINNET =
  "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95";
export const UNISWAP_FACTORY_ADDRESS_RINKEBY =
  "0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36";
export const DEFAULT_WRAPPED_NFT_LIQUIDATION_UNISWAP_SLIPPAGE_IN_BASIS_POINTS = 1000;
export const DEFAULT_BUYER_FEE_BASIS_POINTS = 0;
export const DEFAULT_SELLER_FEE_BASIS_POINTS = 250;
export const OPENSEA_SELLER_BOUNTY_BASIS_POINTS = 100;
export const DEFAULT_MAX_BOUNTY = DEFAULT_SELLER_FEE_BASIS_POINTS;
export const MIN_EXPIRATION_MINUTES = 15;
export const MAX_EXPIRATION_MONTHS = 3;
export const ORDER_MATCHING_LATENCY_SECONDS = 60 * 60 * 24 * 7;
const ORDERBOOK_VERSION = 1 as number;
export const API_BASE_MAINNET = "https://api.opensea.io";
export const API_BASE_RINKEBY = "https://testnets-api.opensea.io";
export const SITE_HOST_MAINNET = "https://opensea.io";
export const SITE_HOST_RINKEBY = "https://rinkeby.opensea.io";
export const RPC_URL_PATH = "jsonrpc/v1/";
export const MAINNET_PROVIDER_URL = `${API_BASE_MAINNET}/${RPC_URL_PATH}`;
export const RINKEBY_PROVIDER_URL = `${API_BASE_RINKEBY}/${RPC_URL_PATH}`;
export const ORDERBOOK_PATH = `/wyvern/v${ORDERBOOK_VERSION}`;
export const API_PATH = `/api/v${ORDERBOOK_VERSION}`;

export const EIP_712_ORDER_TYPES = {
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

export const EIP_712_WYVERN_DOMAIN_NAME = "Wyvern Exchange Contract";
export const EIP_712_WYVERN_DOMAIN_VERSION = "2.3";
export const MERKLE_VALIDATOR_MAINNET =
  "0xbaf2127b49fc93cbca6269fade0f7f31df4c88a7";
export const MERKLE_VALIDATOR_RINKEBY =
  "0x45b594792a5cdc008d0de1c1d69faa3d16b3ddc1";

export const CROSS_CHAIN_DEFAULT_CONDUIT_KEY =
  "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000";
const CROSS_CHAIN_DEFAULT_CONDUIT =
  "0x1e0049783f008a0085193e00003d00cd54003c71";

export const CONDUIT_KEYS_TO_CONDUIT = {
  [CROSS_CHAIN_DEFAULT_CONDUIT_KEY]: CROSS_CHAIN_DEFAULT_CONDUIT,
};

export const WETH_ADDRESS_BY_NETWORK = {
  [Network.Main]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  [Network.Rinkeby]: "0xc778417e063141139fce010982780140aa0cd5ab",
} as const;

export const DEFAULT_ZONE_BY_NETWORK = {
  [Network.Main]: "0x004c00500000ad104d7dbd00e3ae0a5c00560c00",
  [Network.Rinkeby]: "0x00000000e88fe2628ebc5da81d2b3cead633e89e",
} as const;
