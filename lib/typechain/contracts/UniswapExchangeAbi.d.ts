/// <reference types="node" />
import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import { Callback, PayableTransactionObject, NonPayableTransactionObject, BlockType, ContractEventLog, BaseContract } from "./types";
export interface EventOptions {
    filter?: object;
    fromBlock?: BlockType;
    topics?: string[];
}
export declare type TokenPurchase = ContractEventLog<{
    buyer: string;
    eth_sold: string;
    tokens_bought: string;
    0: string;
    1: string;
    2: string;
}>;
export declare type EthPurchase = ContractEventLog<{
    buyer: string;
    tokens_sold: string;
    eth_bought: string;
    0: string;
    1: string;
    2: string;
}>;
export declare type AddLiquidity = ContractEventLog<{
    provider: string;
    eth_amount: string;
    token_amount: string;
    0: string;
    1: string;
    2: string;
}>;
export declare type RemoveLiquidity = ContractEventLog<{
    provider: string;
    eth_amount: string;
    token_amount: string;
    0: string;
    1: string;
    2: string;
}>;
export declare type Transfer = ContractEventLog<{
    _from: string;
    _to: string;
    _value: string;
    0: string;
    1: string;
    2: string;
}>;
export declare type Approval = ContractEventLog<{
    _owner: string;
    _spender: string;
    _value: string;
    0: string;
    1: string;
    2: string;
}>;
export interface UniswapExchangeAbi extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): UniswapExchangeAbi;
    clone(): UniswapExchangeAbi;
    methods: {
        setup(token_addr: string): NonPayableTransactionObject<void>;
        addLiquidity(min_liquidity: number | string | BN, max_tokens: number | string | BN, deadline: number | string | BN): PayableTransactionObject<string>;
        removeLiquidity(amount: number | string | BN, min_eth: number | string | BN, min_tokens: number | string | BN, deadline: number | string | BN): NonPayableTransactionObject<{
            out_a: string;
            out_b: string;
            0: string;
            1: string;
        }>;
        __default__(): PayableTransactionObject<void>;
        ethToTokenSwapInput(min_tokens: number | string | BN, deadline: number | string | BN): PayableTransactionObject<string>;
        ethToTokenTransferInput(min_tokens: number | string | BN, deadline: number | string | BN, recipient: string): PayableTransactionObject<string>;
        ethToTokenSwapOutput(tokens_bought: number | string | BN, deadline: number | string | BN): PayableTransactionObject<string>;
        ethToTokenTransferOutput(tokens_bought: number | string | BN, deadline: number | string | BN, recipient: string): PayableTransactionObject<string>;
        tokenToEthSwapInput(tokens_sold: number | string | BN, min_eth: number | string | BN, deadline: number | string | BN): NonPayableTransactionObject<string>;
        tokenToEthTransferInput(tokens_sold: number | string | BN, min_eth: number | string | BN, deadline: number | string | BN, recipient: string): NonPayableTransactionObject<string>;
        tokenToEthSwapOutput(eth_bought: number | string | BN, max_tokens: number | string | BN, deadline: number | string | BN): NonPayableTransactionObject<string>;
        tokenToEthTransferOutput(eth_bought: number | string | BN, max_tokens: number | string | BN, deadline: number | string | BN, recipient: string): NonPayableTransactionObject<string>;
        tokenToTokenSwapInput(tokens_sold: number | string | BN, min_tokens_bought: number | string | BN, min_eth_bought: number | string | BN, deadline: number | string | BN, token_addr: string): NonPayableTransactionObject<string>;
        tokenToTokenTransferInput(tokens_sold: number | string | BN, min_tokens_bought: number | string | BN, min_eth_bought: number | string | BN, deadline: number | string | BN, recipient: string, token_addr: string): NonPayableTransactionObject<string>;
        tokenToTokenSwapOutput(tokens_bought: number | string | BN, max_tokens_sold: number | string | BN, max_eth_sold: number | string | BN, deadline: number | string | BN, token_addr: string): NonPayableTransactionObject<string>;
        tokenToTokenTransferOutput(tokens_bought: number | string | BN, max_tokens_sold: number | string | BN, max_eth_sold: number | string | BN, deadline: number | string | BN, recipient: string, token_addr: string): NonPayableTransactionObject<string>;
        tokenToExchangeSwapInput(tokens_sold: number | string | BN, min_tokens_bought: number | string | BN, min_eth_bought: number | string | BN, deadline: number | string | BN, exchange_addr: string): NonPayableTransactionObject<string>;
        tokenToExchangeTransferInput(tokens_sold: number | string | BN, min_tokens_bought: number | string | BN, min_eth_bought: number | string | BN, deadline: number | string | BN, recipient: string, exchange_addr: string): NonPayableTransactionObject<string>;
        tokenToExchangeSwapOutput(tokens_bought: number | string | BN, max_tokens_sold: number | string | BN, max_eth_sold: number | string | BN, deadline: number | string | BN, exchange_addr: string): NonPayableTransactionObject<string>;
        tokenToExchangeTransferOutput(tokens_bought: number | string | BN, max_tokens_sold: number | string | BN, max_eth_sold: number | string | BN, deadline: number | string | BN, recipient: string, exchange_addr: string): NonPayableTransactionObject<string>;
        getEthToTokenInputPrice(eth_sold: number | string | BN): NonPayableTransactionObject<string>;
        getEthToTokenOutputPrice(tokens_bought: number | string | BN): NonPayableTransactionObject<string>;
        getTokenToEthInputPrice(tokens_sold: number | string | BN): NonPayableTransactionObject<string>;
        getTokenToEthOutputPrice(eth_bought: number | string | BN): NonPayableTransactionObject<string>;
        tokenAddress(): NonPayableTransactionObject<string>;
        factoryAddress(): NonPayableTransactionObject<string>;
        balanceOf(_owner: string): NonPayableTransactionObject<string>;
        transfer(_to: string, _value: number | string | BN): NonPayableTransactionObject<boolean>;
        transferFrom(_from: string, _to: string, _value: number | string | BN): NonPayableTransactionObject<boolean>;
        approve(_spender: string, _value: number | string | BN): NonPayableTransactionObject<boolean>;
        allowance(_owner: string, _spender: string): NonPayableTransactionObject<string>;
        name(): NonPayableTransactionObject<string>;
        symbol(): NonPayableTransactionObject<string>;
        decimals(): NonPayableTransactionObject<string>;
        totalSupply(): NonPayableTransactionObject<string>;
    };
    events: {
        TokenPurchase(cb?: Callback<TokenPurchase>): EventEmitter;
        TokenPurchase(options?: EventOptions, cb?: Callback<TokenPurchase>): EventEmitter;
        EthPurchase(cb?: Callback<EthPurchase>): EventEmitter;
        EthPurchase(options?: EventOptions, cb?: Callback<EthPurchase>): EventEmitter;
        AddLiquidity(cb?: Callback<AddLiquidity>): EventEmitter;
        AddLiquidity(options?: EventOptions, cb?: Callback<AddLiquidity>): EventEmitter;
        RemoveLiquidity(cb?: Callback<RemoveLiquidity>): EventEmitter;
        RemoveLiquidity(options?: EventOptions, cb?: Callback<RemoveLiquidity>): EventEmitter;
        Transfer(cb?: Callback<Transfer>): EventEmitter;
        Transfer(options?: EventOptions, cb?: Callback<Transfer>): EventEmitter;
        Approval(cb?: Callback<Approval>): EventEmitter;
        Approval(options?: EventOptions, cb?: Callback<Approval>): EventEmitter;
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
    };
    once(event: "TokenPurchase", cb: Callback<TokenPurchase>): void;
    once(event: "TokenPurchase", options: EventOptions, cb: Callback<TokenPurchase>): void;
    once(event: "EthPurchase", cb: Callback<EthPurchase>): void;
    once(event: "EthPurchase", options: EventOptions, cb: Callback<EthPurchase>): void;
    once(event: "AddLiquidity", cb: Callback<AddLiquidity>): void;
    once(event: "AddLiquidity", options: EventOptions, cb: Callback<AddLiquidity>): void;
    once(event: "RemoveLiquidity", cb: Callback<RemoveLiquidity>): void;
    once(event: "RemoveLiquidity", options: EventOptions, cb: Callback<RemoveLiquidity>): void;
    once(event: "Transfer", cb: Callback<Transfer>): void;
    once(event: "Transfer", options: EventOptions, cb: Callback<Transfer>): void;
    once(event: "Approval", cb: Callback<Approval>): void;
    once(event: "Approval", options: EventOptions, cb: Callback<Approval>): void;
}
