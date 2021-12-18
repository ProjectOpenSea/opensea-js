import BigNumber from "bignumber.js";
import * as Web3 from "web3";
import { WyvernProtocol } from "wyvern-js";
import { AnnotatedFunctionABI, Schema } from "wyvern-schemas/dist/types";
import { Asset, AssetEvent, ECSignature, OpenSeaAccount, OpenSeaAsset, OpenSeaAssetBundle, OpenSeaAssetContract, OpenSeaCollection, OpenSeaFungibleToken, OpenSeaUser, Order, OrderJSON, Transaction, UnhashedOrder, UnsignedOrder, Web3Callback, WyvernAsset, WyvernBundle, WyvernFTAsset, WyvernNFTAsset } from "../types";
export { WyvernProtocol };
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
export declare function promisifyCall<T>(callback: (fn: Web3Callback<T>) => T, onError?: (error: unknown) => void): Promise<T | undefined>;
export declare const confirmTransaction: (web3: Web3, txHash: string) => Promise<unknown>;
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
export declare function personalSignAsync(web3: Web3, message: string, signerAddress: string): Promise<ECSignature>;
/**
 * Checks whether a given address contains any code
 * @param web3 Web3 instance
 * @param address input address
 */
export declare function isContractAddress(web3: Web3, address: string): Promise<boolean>;
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
export declare function sendRawTransaction(web3: Web3, { from, to, data, gasPrice, value, gas }: Web3.TxData, onError: (error: unknown) => void): Promise<string>;
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
export declare function rawCall(web3: Web3, { from, to, data }: Web3.CallData, onError?: (error: unknown) => void): Promise<string>;
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
export declare function getTransferFeeSettings(web3: Web3, { asset, accountAddress, }: {
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
 * Get the Wyvern representation of a fungible asset
 * @param schema The WyvernSchema needed to access this asset
 * @param asset The asset to trade
 * @param quantity The number of items to trade
 */
export declare function getWyvernAsset(schema: Schema<WyvernAsset>, asset: Asset, quantity?: BigNumber): WyvernAsset;
/**
 * Get the Wyvern representation of a group of assets
 * Sort order is enforced here. Throws if there's a duplicate.
 * @param assets Assets to bundle
 * @param schemas The WyvernSchemas needed to access each asset, respectively
 * @param quantities The quantity of each asset to bundle, respectively
 */
export declare function getWyvernBundle(assets: Asset[], schemas: Array<Schema<WyvernAsset>>, quantities: BigNumber[]): WyvernBundle;
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
export declare function delay(ms: number): Promise<unknown>;
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
export declare function getNonCompliantApprovalAddress(erc721Contract: Web3.ContractInstance, tokenId: string, _accountAddress: string): Promise<string | undefined>;
