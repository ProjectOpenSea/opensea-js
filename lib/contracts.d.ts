export declare const getMethod: (abi: {
    type: string;
    name?: string | undefined;
    inputs?: object[] | undefined;
    outputs?: object[] | undefined;
    payable?: boolean | undefined;
    constant?: boolean | undefined;
    anonymous?: boolean | undefined;
    stateMutability?: string | undefined;
}[], name: string) => {
    type: string;
    name?: string | undefined;
    inputs?: object[] | undefined;
    outputs?: object[] | undefined;
    payable?: boolean | undefined;
    constant?: boolean | undefined;
    anonymous?: boolean | undefined;
    stateMutability?: string | undefined;
};
export declare const event: (abi: {
    type: string;
    name?: string | undefined;
    inputs?: object[] | undefined;
    outputs?: object[] | undefined;
    payable?: boolean | undefined;
    constant?: boolean | undefined;
    anonymous?: boolean | undefined;
    stateMutability?: string | undefined;
}[], name: string) => {
    type: string;
    name?: string | undefined;
    inputs?: object[] | undefined;
    outputs?: object[] | undefined;
    payable?: boolean | undefined;
    constant?: boolean | undefined;
    anonymous?: boolean | undefined;
    stateMutability?: string | undefined;
};
export declare const DECENTRALAND_AUCTION_CONFIG: {
    '1': string;
};
export { ERC20 } from './abi/ERC20';
export { ERC721 } from './abi/ERC721v3';
export { CanonicalWETH } from './abi/CanonicalWETH';
