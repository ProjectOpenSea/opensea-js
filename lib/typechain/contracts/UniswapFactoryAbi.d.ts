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
export declare type NewExchange = ContractEventLog<{
    token: string;
    exchange: string;
    0: string;
    1: string;
}>;
export interface UniswapFactoryAbi extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): UniswapFactoryAbi;
    clone(): UniswapFactoryAbi;
    methods: {
        initializeFactory(template: string): NonPayableTransactionObject<void>;
        createExchange(token: string): NonPayableTransactionObject<string>;
        getExchange(token: string): NonPayableTransactionObject<string>;
        getToken(exchange: string): NonPayableTransactionObject<string>;
        getTokenWithId(token_id: number | string | BN): NonPayableTransactionObject<string>;
        exchangeTemplate(): NonPayableTransactionObject<string>;
        tokenCount(): NonPayableTransactionObject<string>;
    };
    events: {
        NewExchange(cb?: Callback<NewExchange>): EventEmitter;
        NewExchange(options?: EventOptions, cb?: Callback<NewExchange>): EventEmitter;
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
    };
    once(event: "NewExchange", cb: Callback<NewExchange>): void;
    once(event: "NewExchange", options: EventOptions, cb: Callback<NewExchange>): void;
}
