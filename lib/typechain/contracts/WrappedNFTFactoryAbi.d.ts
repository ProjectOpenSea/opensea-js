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
export declare type NewWrapperContractCreated = ContractEventLog<{
    nftContract: string;
    wrapperContract: string;
    0: string;
    1: string;
}>;
export declare type OwnershipTransferred = ContractEventLog<{
    previousOwner: string;
    newOwner: string;
    0: string;
    1: string;
}>;
export interface WrappedNFTFactoryAbi extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): WrappedNFTFactoryAbi;
    clone(): WrappedNFTFactoryAbi;
    methods: {
        wyvernTokenTransferProxyAddress(): NonPayableTransactionObject<string>;
        uniswapFactoryAddress(): NonPayableTransactionObject<string>;
        importMappingsFromPreviousFactory(_startIndex: number | string | BN, _endIndex: number | string | BN, _previousFactoryAddress: string): NonPayableTransactionObject<void>;
        idToNftContract(arg0: number | string | BN): NonPayableTransactionObject<string>;
        wrapperContractsCreated(): NonPayableTransactionObject<string>;
        wrapperContractToNftContract(arg0: string): NonPayableTransactionObject<string>;
        renounceOwnership(): NonPayableTransactionObject<void>;
        createWrapperContract(_nftContractAddress: string): NonPayableTransactionObject<void>;
        owner(): NonPayableTransactionObject<string>;
        isOwner(): NonPayableTransactionObject<boolean>;
        updateWyvernTokenTransferProxyAddress(_newWyvernTokenTransferProxyAddress: string): NonPayableTransactionObject<void>;
        updateWrappedNFTLiquidationProxyAddress(_newWrappedNFTLiquidationProxyAddress: string): NonPayableTransactionObject<void>;
        nftContractToWrapperContract(arg0: string): NonPayableTransactionObject<string>;
        getWrapperContractForNFTContractAddress(_nftContractAddress: string): NonPayableTransactionObject<string>;
        updateUniswapFactoryContractAddress(_newUniswapFactoryAddress: string): NonPayableTransactionObject<void>;
        transferOwnership(newOwner: string): NonPayableTransactionObject<void>;
        wrappedNFTLiquidationProxyAddress(): NonPayableTransactionObject<string>;
    };
    events: {
        NewWrapperContractCreated(cb?: Callback<NewWrapperContractCreated>): EventEmitter;
        NewWrapperContractCreated(options?: EventOptions, cb?: Callback<NewWrapperContractCreated>): EventEmitter;
        OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter;
        OwnershipTransferred(options?: EventOptions, cb?: Callback<OwnershipTransferred>): EventEmitter;
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
    };
    once(event: "NewWrapperContractCreated", cb: Callback<NewWrapperContractCreated>): void;
    once(event: "NewWrapperContractCreated", options: EventOptions, cb: Callback<NewWrapperContractCreated>): void;
    once(event: "OwnershipTransferred", cb: Callback<OwnershipTransferred>): void;
    once(event: "OwnershipTransferred", options: EventOptions, cb: Callback<OwnershipTransferred>): void;
}
