import { OpenSeaAPI } from "../api";
import { CK_ADDRESS, TESTNET_ASSET_ADDRESS } from "../constants";
import { Network } from "../types";

export const MAINNET_API_KEY = process.env.API_KEY;
export const TESTNET_API_KEY = process.env.API_KEY;

export const mainApi = new OpenSeaAPI(
  {
    apiKey: MAINNET_API_KEY,
    networkName: Network.Main,
  },
  console.info
);

export const testnetApi = new OpenSeaAPI(
  {
    apiKey: TESTNET_API_KEY,
    networkName: Network.Goerli,
  },
  console.info
);

export const apiToTest = testnetApi;

export { CK_ADDRESS, TESTNET_ASSET_ADDRESS };
export const GODS_UNCHAINED_ADDRESS =
  "0x6ebeaf8e8e946f0716e6533a6f2cefc83f60e8ab";
export const DIGITAL_ART_CHAIN_ADDRESS =
  "0x323a3e1693e7a0959f65972f3bf2dfcb93239dfe";
export const MYTHEREUM_ADDRESS = "0xc70be5b7c19529ef642d16c10dfe91c58b5c3bf0";
export const DIGITAL_ART_CHAIN_TOKEN_ID = 189;
export const GODS_UNCHAINED_TOKEN_ID = 76719;
export const MYTHEREUM_TOKEN_ID = 4367;
export const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

export const TESTNET_TOKEN_ID = 0;
export const CK_TOKEN_ID = 637488;
export const TESTNET_SELLER_FEE = 250;

// Toasta Gun, NFT
export const CATS_IN_MECHS_ID =
  "11081664790290028159747096595969945056246807881612483124155840544084353614722";
// Bounty, FT
export const AGE_OF_RUST_TOKEN_ID =
  "10855508365998404086189256032722001339622921863551706494238735756561045520384";
export const DECENTRALAND_ADDRESS =
  "0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d";
export const DECENTRALAND_ID =
  "115792089237316195423570985008687907840339254722644902427849348925505937604680";
export const DISSOLUTION_TOKEN_ID =
  "39803530675327460487158288219684256433559304725576879659134376004308812431360";
export const SPIRIT_CLASH_TOKEN_ID =
  "10855508365998412378240648478527290366700749920879042165450277893550637056000";
export const SPIRIT_CLASH_OWNER = "0x6a846239658f5a16a0b5977e1c0d007bc13267f0";

export const ALEX_ADDRESS = "0xe96a1b303a1eb8d04fb973eb2b291b8d591c8f72";
export const RANDOM_ADDRESS = "0x196a1b303a1eb8d04fb973eb2b291b8d591c8f72";
export const ALEX_ADDRESS_2 = "0x431e44389a003f0ec6e83b3578db5075a44ac523";
export const DEVIN_ADDRESS = "0x0239769a1adf4def9f07da824b80b9c4fcb59593";
export const DAN_ADDRESS = "0x530cf036ed4fa58f7301a9c788c9806624cefd19";
export const DAN_DAPPER_ADDRESS = "0x4819352bd7fadcCFAA8A2cDA4b2825a9ec51417c";
