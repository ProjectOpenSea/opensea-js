/// <reference types="node" />
import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import { Callback, NonPayableTransactionObject, BlockType, ContractEventLog, BaseContract } from "./types";
export interface EventOptions {
    filter?: object;
    fromBlock?: BlockType;
    topics?: string[];
}
export declare type DepositNFTAndMintToken = ContractEventLog<{
    nftId: string;
    0: string;
}>;
export declare type BurnTokenAndWithdrawNFT = ContractEventLog<{
    nftId: string;
    0: string;
}>;
export declare type Transfer = ContractEventLog<{
    from: string;
    to: string;
    value: string;
    0: string;
    1: string;
    2: string;
}>;
export declare type Approval = ContractEventLog<{
    owner: string;
    spender: string;
    value: string;
    0: string;
    1: string;
    2: string;
}>;
export interface WrappedNFTAbi extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): WrappedNFTAbi;
    clone(): WrappedNFTAbi;
    methods: {
        burnTokensAndWithdrawNfts(_nftIds: (number | string | BN)[], _destinationAddresses: string[]): NonPayableTransactionObject<void>;
        name(): NonPayableTransactionObject<string>;
        approve(spender: string, value: number | string | BN): NonPayableTransactionObject<boolean>;
        onERC721Received(_operator: string, _from: string, _tokenId: number | string | BN, _data: string | number[]): NonPayableTransactionObject<string>;
        totalSupply(): NonPayableTransactionObject<string>;
        batchRemoveWithdrawnNFTsFromStorage(_numSlotsToCheck: number | string | BN): NonPayableTransactionObject<void>;
        transferFrom(from: string, to: string, value: number | string | BN): NonPayableTransactionObject<boolean>;
        decimals(): NonPayableTransactionObject<string>;
        wyvernTokenTransferProxyAddress(): NonPayableTransactionObject<string>;
        uniswapFactoryAddress(): NonPayableTransactionObject<string>;
        increaseAllowance(spender: string, addedValue: number | string | BN): NonPayableTransactionObject<boolean>;
        balanceOf(owner: string): NonPayableTransactionObject<string>;
        nftIsDepositedInContract(arg0: number | string | BN): NonPayableTransactionObject<boolean>;
        symbol(): NonPayableTransactionObject<string>;
        depositNftsAndMintTokens(_nftIds: (number | string | BN)[]): NonPayableTransactionObject<void>;
        decreaseAllowance(spender: string, subtractedValue: number | string | BN): NonPayableTransactionObject<boolean>;
        transfer(to: string, value: number | string | BN): NonPayableTransactionObject<boolean>;
        allowance(owner: string, spender: string): NonPayableTransactionObject<string>;
        nftCoreAddress(): NonPayableTransactionObject<string>;
        wrappedNFTLiquidationProxyAddress(): NonPayableTransactionObject<string>;
    };
    events: {
        DepositNFTAndMintToken(cb?: Callback<DepositNFTAndMintToken>): EventEmitter;
        DepositNFTAndMintToken(options?: EventOptions, cb?: Callback<DepositNFTAndMintToken>): EventEmitter;
        BurnTokenAndWithdrawNFT(cb?: Callback<BurnTokenAndWithdrawNFT>): EventEmitter;
        BurnTokenAndWithdrawNFT(options?: EventOptions, cb?: Callback<BurnTokenAndWithdrawNFT>): EventEmitter;
        Transfer(cb?: Callback<Transfer>): EventEmitter;
        Transfer(options?: EventOptions, cb?: Callback<Transfer>): EventEmitter;
        Approval(cb?: Callback<Approval>): EventEmitter;
        Approval(options?: EventOptions, cb?: Callback<Approval>): EventEmitter;
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
    };
    once(event: "DepositNFTAndMintToken", cb: Callback<DepositNFTAndMintToken>): void;
    once(event: "DepositNFTAndMintToken", options: EventOptions, cb: Callback<DepositNFTAndMintToken>): void;
    once(event: "BurnTokenAndWithdrawNFT", cb: Callback<BurnTokenAndWithdrawNFT>): void;
    once(event: "BurnTokenAndWithdrawNFT", options: EventOptions, cb: Callback<BurnTokenAndWithdrawNFT>): void;
    once(event: "Transfer", cb: Callback<Transfer>): void;
    once(event: "Transfer", options: EventOptions, cb: Callback<Transfer>): void;
    once(event: "Approval", cb: Callback<Approval>): void;
    once(event: "Approval", options: EventOptions, cb: Callback<Approval>): void;
}
