import { Schema } from "../../schema";
import { AnnotatedFunctionABI } from "../../types";
interface RinkebyCustomType {
    name: string;
    description: string;
    thumbnail: string;
    url: string;
    transfer: AnnotatedFunctionABI;
}
export declare const rinkebyCustomSchema: Schema<RinkebyCustomType>;
export {};
