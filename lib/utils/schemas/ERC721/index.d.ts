import { Schema } from "../schema";
interface NonFungibleContractType {
    id: string;
    address: string;
}
export declare const ERC721Schema: Schema<NonFungibleContractType>;
export declare const ERC721v3Schema: Schema<NonFungibleContractType>;
export {};
