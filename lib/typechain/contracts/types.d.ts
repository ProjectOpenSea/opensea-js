/// <reference types="node" />
import BN from "bn.js";
import { EventEmitter } from "events";
import { EventLog, PromiEvent, TransactionReceipt } from "web3-core/types";
import { Contract } from "web3-eth-contract";
export interface EstimateGasOptions {
    from?: string;
    gas?: number;
    value?: number | string | BN;
}
export interface EventOptions {
    filter?: object;
    fromBlock?: BlockType;
    topics?: string[];
}
export declare type Callback<T> = (error: Error, result: T) => void;
export interface ContractEventLog<T> extends EventLog {
    returnValues: T;
}
export interface ContractEventEmitter<T> extends EventEmitter {
    on(event: "connected", listener: (subscriptionId: string) => void): this;
    on(event: "data" | "changed", listener: (event: ContractEventLog<T>) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
}
export interface NonPayableTx {
    nonce?: string | number | BN;
    chainId?: string | number | BN;
    from?: string;
    to?: string;
    data?: string;
    gas?: string | number | BN;
    maxPriorityFeePerGas?: string | number | BN;
    maxFeePerGas?: string | number | BN;
    gasPrice?: string | number | BN;
}
export interface PayableTx extends NonPayableTx {
    value?: string | number | BN;
}
export interface NonPayableTransactionObject<T> {
    arguments: any[];
    call(tx?: NonPayableTx, block?: BlockType): Promise<T>;
    send(tx?: NonPayableTx): PromiEvent<TransactionReceipt>;
    estimateGas(tx?: NonPayableTx): Promise<number>;
    encodeABI(): string;
}
export interface PayableTransactionObject<T> {
    arguments: any[];
    call(tx?: PayableTx, block?: BlockType): Promise<T>;
    send(tx?: PayableTx): PromiEvent<TransactionReceipt>;
    estimateGas(tx?: PayableTx): Promise<number>;
    encodeABI(): string;
}
export declare type BlockType = "latest" | "pending" | "genesis" | "earliest" | number | BN;
export declare type BaseContract = Omit<Contract, "clone" | "once">;
