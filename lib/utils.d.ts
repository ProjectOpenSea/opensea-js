import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import { AnnotatedFunctionABI, Schema } from 'wyvern-schemas/dist/types';
import { WyvernAtomicizerContract } from 'wyvern-js/lib/abi_gen/wyvern_atomicizer';
import { HowToCall } from 'wyvern-js/lib/types';
import { Asset, AssetEvent, ECSignature, OpenSeaAccount, OpenSeaAsset, OpenSeaAssetBundle, OpenSeaAssetContract, OpenSeaCollection, OpenSeaFungibleToken, OpenSeaUser, Order, OrderJSON, Transaction, UnhashedOrder, UnsignedOrder, Web3Callback, WyvernAsset, WyvernBundle, WyvernFTAsset, WyvernNFTAsset } from './types';
export declare const annotateERC721TransferABI: (asset: WyvernNFTAsset) => AnnotatedFunctionABI;
export declare const annotateERC20TransferABI: (asset: WyvernFTAsset) => AnnotatedFunctionABI;
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
export declare const assetEventFromJSON: (assetEvent: any) => AssetEvent;
export declare const transactionFromJSON: (transaction: any) => Transaction;
export declare const accountFromJSON: (account: any) => OpenSeaAccount;
export declare const userFromJSON: (user: any) => OpenSeaUser;
export declare const assetBundleFromJSON: (asset_bundle: any) => OpenSeaAssetBundle;
export declare const assetContractFromJSON: (asset_contract: any) => OpenSeaAssetContract;
export declare const collectionFromJSON: (collection: any) => OpenSeaCollection;
export declare const tokenFromJSON: (token: any) => OpenSeaFungibleToken;
export declare const orderFromJSON: (order: any) => Order;
/**
 * Convert an order to JSON, hashing it as well if necessary
 * @param order order (hashed or unhashed)
 */
export declare const orderToJSON: (order: Order) => OrderJSON;
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
export declare function getTransferFeeSettings(web3: Web3, { asset, accountAddress }: {
    asset: Asset;
    accountAddress?: string;
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
export declare function getWyvernAsset(schema: Schema<WyvernAsset>, asset: Asset, quantity?: BigNumber): WyvernAsset;
/**
 * Get the Wyvern representation of an NFT asset
 * @param schema The WyvernSchema needed to access this asset
 * @param asset The asset
 */
export declare function getWyvernNFTAsset(schema: Schema<WyvernNFTAsset>, asset: Asset): WyvernNFTAsset;
/**
 * Get the Wyvern representation of a fungible asset
 * @param schema The WyvernSchema needed to access this asset
 * @param asset The asset to trade
 * @param quantity The number of items to trade
 */
export declare function getWyvernFTAsset(schema: Schema<WyvernFTAsset>, asset: Asset, quantity: BigNumber): WyvernFTAsset;
/**
 * Get the Wyvern representation of a group of NFT assets
 * Sort order is enforced here. Throws if there's a duplicate.
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
/**
 * Get special-case approval addresses for an erc721 contract
 * @param erc721Contract contract to check
 */
export declare function getNonCompliantApprovalAddress(erc721Contract: Web3.ContractInstance, tokenId: string, accountAddress: string): Promise<string | undefined>;
