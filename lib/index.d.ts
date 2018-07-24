import * as Web3 from 'web3';
import { ECSignature, OpenSeaAPIConfig, SaleKind } from './types';
export declare class OpenSea {
    private web3;
    private networkName;
    private wyvernProtocol;
    private api;
    constructor(provider: Web3.Provider, apiConfig?: OpenSeaAPIConfig);
    wrapEth({ amountInEth, accountAddress, awaitConfirmation }: {
        amountInEth: any;
        accountAddress: any;
        awaitConfirmation?: boolean;
    }): Promise<any>;
    unwrapWeth({ amountInEth, accountAddress, awaitConfirmation }: {
        amountInEth: any;
        accountAddress: any;
        awaitConfirmation?: boolean;
    }): Promise<{}>;
    createBuyOrder({ tokenId, tokenAddress, accountAddress, amountInEth, expirationTime }: {
        tokenId: any;
        tokenAddress: any;
        accountAddress: any;
        amountInEth: any;
        expirationTime?: number;
    }): Promise<void>;
    createSellOrder({ tokenId, tokenAddress, accountAddress, startAmountInEth, endAmountInEth, expirationTime }: {
        tokenId: any;
        tokenAddress: any;
        accountAddress: any;
        startAmountInEth: any;
        endAmountInEth: any;
        expirationTime?: number;
    }): Promise<void>;
    fulfillOrder({ order, accountAddress }: {
        order: any;
        accountAddress: any;
    }): Promise<any>;
    cancelOrder({ order, accountAddress }: {
        order: any;
        accountAddress: any;
    }): Promise<string>;
    getApprovedTokenCount({ accountAddress, tokenAddress }: {
        accountAddress: any;
        tokenAddress: any;
    }): Promise<import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/bignumber.js").BigNumber>;
    approveNonFungibleToken({ tokenId, tokenAddress, accountAddress, proxyAddress, tokenAbi }: {
        tokenId: any;
        tokenAddress: any;
        accountAddress: any;
        proxyAddress: any;
        tokenAbi?: ({
            'constant': boolean;
            'inputs': {
                'name': string;
                'type': string;
            }[];
            'name': string;
            'outputs': {
                'name': string;
                'type': string;
            }[];
            'payable': boolean;
            'stateMutability': string;
            'type': string;
            'anonymous'?: undefined;
        } | {
            'inputs': {
                'name': string;
                'type': string;
            }[];
            'payable': boolean;
            'stateMutability': string;
            'type': string;
            'constant'?: undefined;
            'name'?: undefined;
            'outputs'?: undefined;
            'anonymous'?: undefined;
        } | {
            'anonymous': boolean;
            'inputs': {
                'indexed': boolean;
                'name': string;
                'type': string;
            }[];
            'name': string;
            'type': string;
            'constant'?: undefined;
            'outputs'?: undefined;
            'payable'?: undefined;
            'stateMutability'?: undefined;
        })[];
    }): Promise<void>;
    approveFungibleToken({ accountAddress, tokenAddress }: {
        accountAddress: any;
        tokenAddress: any;
    }): Promise<{}>;
    /**
     * Gets the price for the order using the contract
     * @param {object} order Wyvern order object
     */
    getCurrentPrice(order: any): Promise<import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/bignumber.js").BigNumber>;
    /**
     * Helper methods
     */
    _atomicMatch({ buy, sell, accountAddress }: {
        buy: any;
        sell: any;
        accountAddress: any;
    }): Promise<any>;
    _makeMatchingOrder({ order, accountAddress }: {
        order: any;
        accountAddress: any;
    }): Promise<{
        exchange: any;
        maker: any;
        taker: string;
        makerRelayerFee: import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/bignumber.js").BigNumber;
        takerRelayerFee: import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/bignumber.js").BigNumber;
        makerProtocolFee: import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/bignumber.js").BigNumber;
        takerProtocolFee: import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/bignumber.js").BigNumber;
        feeMethod: any;
        feeRecipient: string;
        side: number;
        saleKind: SaleKind;
        target: any;
        howToCall: any;
        calldata: any;
        replacementPattern: any;
        staticTarget: string;
        staticExtradata: string;
        paymentToken: any;
        basePrice: any;
        extra: number;
        listingTime: import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/bignumber.js").BigNumber;
        expirationTime: import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/bignumber.js").BigNumber;
        salt: import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/bignumber.js").BigNumber;
        metadata: any;
    }>;
    _getProxy(accountAddress: any): Promise<string>;
    _initializeProxy(accountAddress: any): Promise<string>;
    _validateSellOrderParameters({ order, accountAddress }: {
        Order: any;
        string: any;
    }): Promise<void>;
    _validateBuyOrderParameters({ order, accountAddress }: {
        Order: any;
        string: any;
    }): Promise<void>;
    _getTokenBalance({ accountAddress, tokenAddress, tokenAbi }: {
        accountAddress: any;
        tokenAddress: any;
        tokenAbi?: ({
            'constant': boolean;
            'inputs': {
                'name': string;
                'type': string;
            }[];
            'name': string;
            'outputs': {
                'name': string;
                'type': string;
            }[];
            'payable': boolean;
            'type': string;
            'anonymous'?: undefined;
        } | {
            'inputs': {
                'name': string;
                'type': string;
            }[];
            'type': string;
            'constant'?: undefined;
            'name'?: undefined;
            'outputs'?: undefined;
            'payable'?: undefined;
            'anonymous'?: undefined;
        } | {
            'payable': boolean;
            'type': string;
            'constant'?: undefined;
            'inputs'?: undefined;
            'name'?: undefined;
            'outputs'?: undefined;
            'anonymous'?: undefined;
        } | {
            'anonymous': boolean;
            'inputs': {
                'indexed': boolean;
                'name': string;
                'type': string;
            }[];
            'name': string;
            'type': string;
            'constant'?: undefined;
            'outputs'?: undefined;
            'payable'?: undefined;
        })[];
    }): Promise<import("../../../../../../../../Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/bignumber.js").BigNumber>;
    _validateAndPostOrder(order: any): Promise<void>;
    _signOrder({ order }: {
        order: any;
    }): ECSignature;
    _getSchema(schemaName?: string): any;
    _getWyvernAsset(schema: any, { tokenId, tokenAddress }: {
        tokenId: any;
        tokenAddress: any;
    }): any;
}
