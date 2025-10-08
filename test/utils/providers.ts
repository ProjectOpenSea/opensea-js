import { ethers } from "ethers";
import { ALCHEMY_API_KEY } from "./env";

export const RPC_PROVIDER_MAINNET = new ethers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
);

export const RPC_PROVIDER_OPTIMISM = new ethers.JsonRpcProvider(
  `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
);

export const RPC_PROVIDER_POLYGON = new ethers.JsonRpcProvider(
  `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
);
