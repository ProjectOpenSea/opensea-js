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
export declare type OwnershipTransferred = ContractEventLog<{
    previousOwner: string;
    newOwner: string;
    0: string;
    1: string;
}>;
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
export declare type CreateEstate = ContractEventLog<{
    _owner: string;
    _estateId: string;
    _data: string;
    0: string;
    1: string;
    2: string;
}>;
export declare type AddLand = ContractEventLog<{
    _estateId: string;
    _landId: string;
    0: string;
    1: string;
}>;
export declare type RemoveLand = ContractEventLog<{
    _estateId: string;
    _landId: string;
    _destinatary: string;
    0: string;
    1: string;
    2: string;
}>;
export declare type Update = ContractEventLog<{
    _assetId: string;
    _holder: string;
    _operator: string;
    _data: string;
    0: string;
    1: string;
    2: string;
    3: string;
}>;
export declare type UpdateOperator = ContractEventLog<{
    _estateId: string;
    _operator: string;
    0: string;
    1: string;
}>;
export declare type SetLANDRegistry = ContractEventLog<{
    _registry: string;
    0: string;
}>;
export declare type Migrated = ContractEventLog<{
    contractName: string;
    migrationId: string;
    0: string;
    1: string;
}>;
export interface DecentralandEstatesAbi extends BaseContract {
    constructor(jsonInterface: any[], address?: string, options?: ContractOptions): DecentralandEstatesAbi;
    clone(): DecentralandEstatesAbi;
    methods: {
        supportsInterface(_interfaceId: string | number[]): NonPayableTransactionObject<boolean>;
        name(): NonPayableTransactionObject<string>;
        "initialize(string,string,address)"(_name: string, _symbol: string, _registry: string): NonPayableTransactionObject<void>;
        "initialize(string,string)"(_name: string, _symbol: string): NonPayableTransactionObject<void>;
        "initialize()"(): NonPayableTransactionObject<void>;
        "initialize(address)"(_sender: string): NonPayableTransactionObject<void>;
        getApproved(_tokenId: number | string | BN): NonPayableTransactionObject<string>;
        approve(_to: string, _tokenId: number | string | BN): NonPayableTransactionObject<void>;
        landIdEstate(arg0: number | string | BN): NonPayableTransactionObject<string>;
        onERC721Received(_operator: string, _from: string, _tokenId: number | string | BN, _data: string | number[]): NonPayableTransactionObject<string>;
        getFingerprint(estateId: number | string | BN): NonPayableTransactionObject<string>;
        totalSupply(): NonPayableTransactionObject<string>;
        transferFrom(_from: string, _to: string, _tokenId: number | string | BN): NonPayableTransactionObject<void>;
        updateLandData(estateId: number | string | BN, landId: number | string | BN, data: string): NonPayableTransactionObject<void>;
        tokenOfOwnerByIndex(_owner: string, _index: number | string | BN): NonPayableTransactionObject<string>;
        estateLandIds(arg0: number | string | BN, arg1: number | string | BN): NonPayableTransactionObject<string>;
        transferManyLands(estateId: number | string | BN, landIds: (number | string | BN)[], destinatary: string): NonPayableTransactionObject<void>;
        updateManyLandData(estateId: number | string | BN, landIds: (number | string | BN)[], data: string): NonPayableTransactionObject<void>;
        "safeTransferFrom(address,address,uint256)"(_from: string, _to: string, _tokenId: number | string | BN): NonPayableTransactionObject<void>;
        "safeTransferFrom(address,address,uint256,bytes)"(_from: string, _to: string, _tokenId: number | string | BN, _data: string | number[]): NonPayableTransactionObject<void>;
        exists(_tokenId: number | string | BN): NonPayableTransactionObject<boolean>;
        tokenByIndex(_index: number | string | BN): NonPayableTransactionObject<string>;
        setLANDRegistry(_registry: string): NonPayableTransactionObject<void>;
        updateMetadata(estateId: number | string | BN, metadata: string): NonPayableTransactionObject<void>;
        ping(): NonPayableTransactionObject<void>;
        ownerOf(_tokenId: number | string | BN): NonPayableTransactionObject<string>;
        isUpdateAuthorized(operator: string, estateId: number | string | BN): NonPayableTransactionObject<boolean>;
        balanceOf(_owner: string): NonPayableTransactionObject<string>;
        "safeTransferManyFrom(address,address,uint256[])"(from: string, to: string, estateIds: (number | string | BN)[]): NonPayableTransactionObject<void>;
        "safeTransferManyFrom(address,address,uint256[],bytes)"(from: string, to: string, estateIds: (number | string | BN)[], data: string | number[]): NonPayableTransactionObject<void>;
        registry(): NonPayableTransactionObject<string>;
        owner(): NonPayableTransactionObject<string>;
        verifyFingerprint(estateId: number | string | BN, fingerprint: string | number[]): NonPayableTransactionObject<boolean>;
        symbol(): NonPayableTransactionObject<string>;
        updateOperator(arg0: number | string | BN): NonPayableTransactionObject<string>;
        estateLandIndex(arg0: number | string | BN, arg1: number | string | BN): NonPayableTransactionObject<string>;
        setApprovalForAll(_to: string, _approved: boolean): NonPayableTransactionObject<void>;
        transferLand(estateId: number | string | BN, landId: number | string | BN, destinatary: string): NonPayableTransactionObject<void>;
        getMetadata(estateId: number | string | BN): NonPayableTransactionObject<string>;
        setUpdateOperator(estateId: number | string | BN, operator: string): NonPayableTransactionObject<void>;
        getLandEstateId(landId: number | string | BN): NonPayableTransactionObject<string>;
        isMigrated(contractName: string, migrationId: string): NonPayableTransactionObject<boolean>;
        tokenURI(_tokenId: number | string | BN): NonPayableTransactionObject<string>;
        mint(to: string, metadata: string): NonPayableTransactionObject<string>;
        isApprovedForAll(_owner: string, _operator: string): NonPayableTransactionObject<boolean>;
        transferOwnership(newOwner: string): NonPayableTransactionObject<void>;
        getEstateSize(estateId: number | string | BN): NonPayableTransactionObject<string>;
    };
    events: {
        OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter;
        OwnershipTransferred(options?: EventOptions, cb?: Callback<OwnershipTransferred>): EventEmitter;
        Transfer(cb?: Callback<Transfer>): EventEmitter;
        Transfer(options?: EventOptions, cb?: Callback<Transfer>): EventEmitter;
        Approval(cb?: Callback<Approval>): EventEmitter;
        Approval(options?: EventOptions, cb?: Callback<Approval>): EventEmitter;
        ApprovalForAll(cb?: Callback<ApprovalForAll>): EventEmitter;
        ApprovalForAll(options?: EventOptions, cb?: Callback<ApprovalForAll>): EventEmitter;
        CreateEstate(cb?: Callback<CreateEstate>): EventEmitter;
        CreateEstate(options?: EventOptions, cb?: Callback<CreateEstate>): EventEmitter;
        AddLand(cb?: Callback<AddLand>): EventEmitter;
        AddLand(options?: EventOptions, cb?: Callback<AddLand>): EventEmitter;
        RemoveLand(cb?: Callback<RemoveLand>): EventEmitter;
        RemoveLand(options?: EventOptions, cb?: Callback<RemoveLand>): EventEmitter;
        Update(cb?: Callback<Update>): EventEmitter;
        Update(options?: EventOptions, cb?: Callback<Update>): EventEmitter;
        UpdateOperator(cb?: Callback<UpdateOperator>): EventEmitter;
        UpdateOperator(options?: EventOptions, cb?: Callback<UpdateOperator>): EventEmitter;
        SetLANDRegistry(cb?: Callback<SetLANDRegistry>): EventEmitter;
        SetLANDRegistry(options?: EventOptions, cb?: Callback<SetLANDRegistry>): EventEmitter;
        Migrated(cb?: Callback<Migrated>): EventEmitter;
        Migrated(options?: EventOptions, cb?: Callback<Migrated>): EventEmitter;
        allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
    };
    once(event: "OwnershipTransferred", cb: Callback<OwnershipTransferred>): void;
    once(event: "OwnershipTransferred", options: EventOptions, cb: Callback<OwnershipTransferred>): void;
    once(event: "Transfer", cb: Callback<Transfer>): void;
    once(event: "Transfer", options: EventOptions, cb: Callback<Transfer>): void;
    once(event: "Approval", cb: Callback<Approval>): void;
    once(event: "Approval", options: EventOptions, cb: Callback<Approval>): void;
    once(event: "ApprovalForAll", cb: Callback<ApprovalForAll>): void;
    once(event: "ApprovalForAll", options: EventOptions, cb: Callback<ApprovalForAll>): void;
    once(event: "CreateEstate", cb: Callback<CreateEstate>): void;
    once(event: "CreateEstate", options: EventOptions, cb: Callback<CreateEstate>): void;
    once(event: "AddLand", cb: Callback<AddLand>): void;
    once(event: "AddLand", options: EventOptions, cb: Callback<AddLand>): void;
    once(event: "RemoveLand", cb: Callback<RemoveLand>): void;
    once(event: "RemoveLand", options: EventOptions, cb: Callback<RemoveLand>): void;
    once(event: "Update", cb: Callback<Update>): void;
    once(event: "Update", options: EventOptions, cb: Callback<Update>): void;
    once(event: "UpdateOperator", cb: Callback<UpdateOperator>): void;
    once(event: "UpdateOperator", options: EventOptions, cb: Callback<UpdateOperator>): void;
    once(event: "SetLANDRegistry", cb: Callback<SetLANDRegistry>): void;
    once(event: "SetLANDRegistry", options: EventOptions, cb: Callback<SetLANDRegistry>): void;
    once(event: "Migrated", cb: Callback<Migrated>): void;
    once(event: "Migrated", options: EventOptions, cb: Callback<Migrated>): void;
}
