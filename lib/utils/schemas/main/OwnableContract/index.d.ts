import { Schema } from "../../schema";
interface OwnableContractType {
    name?: string;
    description?: string;
    address: string;
}
export declare const OwnableContractSchema: Schema<OwnableContractType>;
export {};
