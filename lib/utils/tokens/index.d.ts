import { Network } from "../../types";
interface Token {
    name: string;
    symbol: string;
    decimals: number;
    address: string;
}
export interface NetworkTokens {
    canonicalWrappedEther: Token;
    otherTokens: Token[];
}
export declare const getCanonicalWrappedEther: (network: Network) => Token;
export declare const getTokens: (network: Network) => NetworkTokens;
export {};
