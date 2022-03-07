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
export declare type Transfer = ContractEventLog<{
    _from: string;
    _to: string;
    _tokenId: string;
    0: string;
    1: string;
    2: string;
}>;
export declare type Approval = ContractEventLog<{
    _owner: string;
    _approved: string;
    _tokenId: string;
    0: string;
    1: string;
    2: string;
}>;
export declare type ApprovalForAll = ContractEventLog<{
    _owner: string;
    _operator: string;
    _approved: boolean;
    0: string;
    1: string;
    2: boolean;
}>;
export interface ERC721v3Abi extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): ERC721v3Abi;
    clone(): ERC721v3Abi;
    methods: {
        name(): NonPayableTransactionObject<string>;
        kittyIndexToApproved(arg0: number | string | BN): NonPayableTransactionObject<string>;
        partIndexToApproved(arg0: number | string | BN): NonPayableTransactionObject<string>;
        allowed(arg0: string, arg1: number | string | BN): NonPayableTransactionObject<string>;
        getApproved(_tokenId: number | string | BN): NonPayableTransactionObject<string>;
        approve(_to: string, _tokenId: number | string | BN): NonPayableTransactionObject<void>;
        totalSupply(): NonPayableTransactionObject<string>;
        transfer(_to: string, _tokenId: number | string | BN): NonPayableTransactionObject<void>;
        transferFrom(_from: string, _to: string, _tokenId: number | string | BN): NonPayableTransactionObject<void>;
        tokenOfOwnerByIndex(_owner: string, _index: number | string | BN): NonPayableTransactionObject<string>;
        "safeTransferFrom(address,address,uint256)"(_from: string, _to: string, _tokenId: number | string | BN): NonPayableTransactionObject<void>;
        "safeTransferFrom(address,address,uint256,bytes)"(_from: string, _to: string, _tokenId: number | string | BN, _data: string | number[]): NonPayableTransactionObject<void>;
        exists(_tokenId: number | string | BN): NonPayableTransactionObject<boolean>;
        tokenByIndex(_index: number | string | BN): NonPayableTransactionObject<string>;
        ownerOf(_tokenId: number | string | BN): NonPayableTransactionObject<string>;
        balanceOf(_owner: string): NonPayableTransactionObject<string>;
        symbol(): NonPayableTransactionObject<string>;
        setApprovalForAll(_to: string, _approved: boolean): NonPayableTransactionObject<void>;
        tokenURI(_tokenId: number | string | BN): NonPayableTransactionObject<string>;
        isApprovedForAll(_owner: string, _operator: string): NonPayableTransactionObject<boolean>;
    };
    events: {
        Transfer(cb?: Callback<Transfer>): EventEmitter;
        Transfer(options?: EventOptions, cb?: Callback<Transfer>): EventEmitter;
        Approval(cb?: Callback<Approval>): EventEmitter;
        Approval(options?: EventOptions, cb?: Callback<Approval>): EventEmitter;
        ApprovalForAll(cb?: Callback<ApprovalForAll>): EventEmitter;
        ApprovalForAll(options?: EventOptions, cb?: Callback<ApprovalForAll>): EventEmitter;
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
    };
    once(event: "Transfer", cb: Callback<Transfer>): void;
    once(event: "Transfer", options: EventOptions, cb: Callback<Transfer>): void;
    once(event: "Approval", cb: Callback<Approval>): void;
    once(event: "Approval", options: EventOptions, cb: Callback<Approval>): void;
    once(event: "ApprovalForAll", cb: Callback<ApprovalForAll>): void;
    once(event: "ApprovalForAll", options: EventOptions, cb: Callback<ApprovalForAll>): void;
}
