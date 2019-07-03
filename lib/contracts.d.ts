import { MethodAbi, EventAbi } from 'web3';
export declare const getMethod: (abi: Readonly<import("src/types").PartialAbiDefinition>[], name: string) => MethodAbi;
export declare const event: (abi: Readonly<import("src/types").PartialAbiDefinition>[], name: string) => EventAbi;
export declare const DECENTRALAND_AUCTION_CONFIG: {
    '1': string;
};
export { ERC20 } from './abi/ERC20';
export { ERC721 } from './abi/ERC721v3';
export { ERC1155 } from './abi/ERC1155';
export { CanonicalWETH } from './abi/CanonicalWETH';
