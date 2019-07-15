import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { Schema, AnnotatedFunctionABI } from 'wyvern-schemas/dist-tsc/types';
import { WyvernAtomicizerContract } from 'wyvern-js/lib/abi_gen/wyvern_atomicizer';
import { HowToCall } from 'wyvern-js/lib/types';
import { ECSignature, Order, Web3Callback, OrderJSON, UnhashedOrder, OpenSeaAsset, OpenSeaAssetBundle, UnsignedOrder, WyvernAsset, Asset, WyvernBundle, WyvernAssetLocation, WyvernENSNameAsset, WyvernNFTAsset, OpenSeaAssetContract, WyvernERC721Asset, FungibleAsset, WyvernFTAsset, OpenSeaFungibleToken } from './types';
export declare const NULL_ADDRESS: string;
export declare const NULL_BLOCK_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const OPENSEA_FEE_RECIPIENT = "0x5b3256965e7c3cf26e11fcaf296dfc8807c01073";
export declare const DEP_INFURA_KEY = "e8695bce67944848aa95459fac052f8e";
export declare const MAINNET_PROVIDER_URL = "https://eth-mainnet.alchemyapi.io/jsonrpc/y5dLONzfAJh-oCY02DCP3UWCT2pSEXMo";
export declare const RINKEBY_PROVIDER_URL = "https://eth-rinkeby.alchemyapi.io/jsonrpc/-yDg7wmgGw5LdsP4p4kyxRYuDzCkXtoI";
export declare const INVERSE_BASIS_POINT = 10000;
export declare const MAX_UINT_256: BigNumber;
export declare const WYVERN_EXCHANGE_ADDRESS_MAINNET = "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b";
export declare const WYVERN_EXCHANGE_ADDRESS_RINKEBY = "0x5206e78b21ce315ce284fb24cf05e0585a93b1d9";
export declare const ENJIN_COIN_ADDRESS = "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c";
export declare const ENJIN_ADDRESS = "0x8562c38485B1E8cCd82E44F89823dA76C98eb0Ab";
export declare const CK_ADDRESS = "0x06012c8cf97bead5deae237070f9587f8e7a266d";
export declare const CK_RINKEBY_ADDRESS = "0x16baf0de678e52367adc69fd067e5edd1d33e3bf";
export declare const DEFAULT_BUYER_FEE_BASIS_POINTS = 0;
export declare const DEFAULT_SELLER_FEE_BASIS_POINTS = 250;
export declare const OPENSEA_SELLER_BOUNTY_BASIS_POINTS = 100;
export declare const DEFAULT_MAX_BOUNTY = 250;
export declare const MAX_ERROR_LENGTH = 120;
export declare const MIN_EXPIRATION_SECONDS = 10;
export declare const ORDER_MATCHING_LATENCY_SECONDS: number;
export declare const SELL_ORDER_BATCH_SIZE = 3;
export declare const DEFAULT_GAS_INCREASE_FACTOR = 1.1;
export declare const annotateERC721TransferABI: (asset: WyvernERC721Asset) => AnnotatedFunctionABI;
/**
 * Promisify a call a method on a contract,
 * handling Parity errors. Returns '0x' if error.
 * Note that if T is not "string", this may return a falsey
 * value when the contract doesn't support the method (e.g. `isApprovedForAll`).
 * @param callback An anonymous function that takes a web3 callback
 * and returns a Web3 Contract's call result, e.g. `c => erc721.ownerOf(3, c)`
 * @param onError callback when user denies transaction
 */
export declare function promisifyCall<T>(callback: (fn: Web3Callback<T>) => void, onError?: (error: Error) => void): Promise<T | undefined>;
export declare const confirmTransaction: (web3: Web3, txHash: string) => Promise<{}>;
export declare const assetFromJSON: (asset: any) => OpenSeaAsset;
export declare const assetBundleFromJSON: (asset_bundle: any) => OpenSeaAssetBundle;
export declare const assetContractFromJSON: (asset_contract: any) => OpenSeaAssetContract;
export declare const tokenFromJSON: (token: any) => OpenSeaFungibleToken;
export declare const orderFromJSON: (order: any) => Order;
/**
 * Convert an order to JSON, hashing it as well if necessary
 * @param order order (hashed or unhashed)
 */
export declare const orderToJSON: (order: Order) => OrderJSON;
export declare const findAsset: (web3: Web3, { account, proxy, wyAsset, schema }: {
    account: string;
    proxy: string;
    wyAsset: any;
    schema: any;
}, retries?: number) => Promise<WyvernAssetLocation | undefined>;
/**
 * Sign messages using web3 personal signatures
 * @param web3 Web3 instance
 * @param message message to sign
 * @param signerAddress web3 address signing the message
 * @returns A signature if provider can sign, otherwise null
 */
export declare function personalSignAsync(web3: Web3, message: string, signerAddress: string): Promise<ECSignature | null>;
/**
 * Special fixes for making BigNumbers using web3 results
 * @param arg An arg or the result of a web3 call to turn into a BigNumber
 */
export declare function makeBigNumber(arg: number | string | BigNumber): BigNumber;
/**
 * Send a transaction to the blockchain and optionally confirm it
 * @param web3 Web3 instance
 * @param param0 __namedParameters
 * @param from address sending transaction
 * @param to destination contract address
 * @param data data to send to contract
 * @param gasPrice gas price to use. If unspecified, uses web3 default (mean gas price)
 * @param value value in ETH to send with data. Defaults to 0
 * @param onError callback when user denies transaction
 */
export declare function sendRawTransaction(web3: Web3, { from, to, data, gasPrice, value, gas }: Web3.TxData, onError: (error: Error) => void): Promise<string>;
/**
 * Call a method on a contract, sending arbitrary data and
 * handling Parity errors. Returns '0x' if error.
 * @param web3 Web3 instance
 * @param param0 __namedParameters
 * @param from address sending call
 * @param to destination contract address
 * @param data data to send to contract
 * @param onError callback when user denies transaction
 */
export declare function rawCall(web3: Web3, { from, to, data }: Web3.CallData, onError?: (error: Error) => void): Promise<string>;
/**
 * Estimate Gas usage for a transaction
 * @param web3 Web3 instance
 * @param from address sending transaction
 * @param to destination contract address
 * @param data data to send to contract
 * @param value value in ETH to send with data
 */
export declare function estimateGas(web3: Web3, { from, to, data, value }: Web3.TxData): Promise<number>;
/**
 * Get mean gas price for sending a txn, in wei
 * @param web3 Web3 instance
 */
export declare function getCurrentGasPrice(web3: Web3): Promise<BigNumber>;
/**
 * Get current transfer fees for an asset
 * @param web3 Web3 instance
 * @param asset The asset to check for transfer fees
 */
export declare function getTransferFeeSettings(web3: Web3, { asset }: {
    asset: Asset;
}): Promise<{
    transferFee: BigNumber | undefined;
    transferFeeTokenAddress: string | undefined;
}>;
/**
 * Estimates the price of an order
 * @param order The order to estimate price on
 * @param secondsToBacktrack The number of seconds to subtract on current time,
 *  to fix race conditions
 * @param shouldRoundUp Whether to round up fractional wei
 */
export declare function estimateCurrentPrice(order: Order, secondsToBacktrack?: number, shouldRoundUp?: boolean): BigNumber;
/**
 * Wrapper function for getting generic Wyvern assets from OpenSea assets
 * @param schema Wyvern schema for the asset
 * @param asset The fungible or nonfungible asset to format
 */
export declare function getWyvernAsset(schema: Schema<WyvernNFTAsset | WyvernFTAsset>, asset: Asset | FungibleAsset, quantity?: number): WyvernNFTAsset | WyvernFTAsset;
/**
 * Get the Wyvern representation of an NFT asset
 * @param schema The WyvernSchema needed to access this asset
 * @param tokenId The token's id
 * @param tokenAddress The address of the token's contract
 */
export declare function getWyvernNFTAsset(schema: Schema<WyvernNFTAsset>, tokenId: string, tokenAddress: string): WyvernNFTAsset;
/**
 * Get the Wyvern representation of a fungible asset
 * @param schema The WyvernSchema needed to access this asset
 * @param address The address of the token's contract
 * @param identifier The identifier string of the fungible asset
 * @param quantity The number of items to trade
 * @param classID The numerical ID (converted from hex) for the asset's class. Can be undefined if this asset is fully fungible (ERC-20).
 */
export declare function getWyvernFTAsset(schema: Schema<WyvernFTAsset>, address: string, identifier: string, quantity: number, classID?: string): WyvernFTAsset;
/**
 * Get the Wyvern representation of an ENS name as an asset
 * @param schema The WyvernSchema needed to access this asset
 * @param name The ENS name, ending in .eth
 */
export declare function getWyvernENSNameAsset(schema: Schema<WyvernENSNameAsset>, name: string): WyvernENSNameAsset;
/**
 * Get the Wyvern representation of a group of NFT assets
 * Sort order is enforced here
 * @param schema The WyvernSchema needed to access these assets
 * @param assets Assets to bundle
 */
export declare function getWyvernBundle(schema: any, assets: Asset[]): WyvernBundle;
/**
 * Get the non-prefixed hash for the order
 * (Fixes a Wyvern typescript issue and casing issue)
 * @param order order to hash
 */
export declare function getOrderHash(order: UnhashedOrder): string;
/**
 * Assign an order and a new matching order to their buy/sell sides
 * @param order Original order
 * @param matchingOrder The result of _makeMatchingOrder
 */
export declare function assignOrdersToSides(order: Order, matchingOrder: UnsignedOrder): {
    buy: Order;
    sell: Order;
};
/**
 * Delay using setTimeout
 * @param ms milliseconds to wait
 */
export declare function delay(ms: number): Promise<{}>;
/**
 * Encode the atomicized transfer of many assets
 * @param schema Wyvern Schema for the assets
 * @param assets List of assets to transfer
 * @param from Current address owning the assets
 * @param to Destination address
 * @param atomicizer Wyvern Atomicizer instance
 */
export declare function encodeAtomicizedTransfer(schema: Schema<any>, assets: WyvernAsset[], from: string, to: string, atomicizer: WyvernAtomicizerContract): {
    calldata: string;
};
/**
 * Encode a transfer call for a Wyvern schema function
 * @param transferAbi Annotated Wyvern ABI
 * @param from From address
 * @param to To address
 */
export declare function encodeTransferCall(transferAbi: AnnotatedFunctionABI, from: string, to: string): string;
/**
 * Encode a call to a user's proxy contract
 * @param address The address for the proxy to call
 * @param howToCall How to call the addres
 * @param calldata The data to use in the call
 * @param shouldAssert Whether to assert success in the proxy call
 */
export declare function encodeProxyCall(address: string, howToCall: HowToCall, calldata: string, shouldAssert?: boolean): string;
/**
 * Validates that an address exists, isn't null, and is properly
 * formatted for Wyvern and OpenSea
 * @param address input address
 */
export declare function validateAndFormatWalletAddress(web3: Web3, address: string): string;
/**
 * Notify developer when a pattern will be deprecated
 * @param msg message to log to console
 */
export declare function onDeprecated(msg: string): void;
