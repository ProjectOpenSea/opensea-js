import { ethers } from "ethers";
import type { Context as MochaContext } from "mocha";
import { alchemyProvider } from "./providers";
import { Chain } from "../../src/types";

export const normalizeChain = (chain: string): Chain => {
  if (!chain) {
    throw new Error("normalizeChain: chain is required");
  }
  const lower = chain.toLowerCase();
  const found = Object.values(Chain).find((value) => value === lower) as
    | Chain
    | undefined;
  if (!found) {
    throw new Error(`normalizeChain: unsupported chain '${chain}'`);
  }
  return found;
};

export const normalizeChainName = (chain: string): string => {
  if (!chain) {
    throw new Error("normalizeChainName: chain is required");
  }
  const lower = chain.toLowerCase();
  const found = Object.values(Chain).find((value) => value === lower);
  if (!found) {
    throw new Error(`normalizeChainName: unsupported chain '${chain}'`);
  }
  // Return the chain name with proper capitalization
  return found.charAt(0).toUpperCase() + found.slice(1);
};

const getProviderForChain = (chain: Chain): ethers.Provider => {
  return alchemyProvider(chain);
};

export const getWalletForChain = (
  privateKey: string,
  chain: Chain,
): ethers.Wallet => {
  return new ethers.Wallet(privateKey, getProviderForChain(chain));
};

export const ensureVarsOrSkip = <T extends Record<string, unknown>>(
  ctx: MochaContext,
  vars: T,
  label?: string,
): boolean => {
  const missing = Object.entries(vars)
    .filter(
      ([, value]) => value === undefined || value === null || value === "",
    )
    .map(([key]) => key);
  if (missing.length > 0) {
    const testName =
      (ctx as { test?: { title?: string } }).test?.title ||
      label ||
      "Unknown test";
    console.log(`${testName} - Skipping test - missing: ${missing.join(", ")}`);
    (ctx as unknown as { skip: () => void }).skip();
    return false;
  }
  return true;
};
