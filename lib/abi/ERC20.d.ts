export declare const ERC20: ({
    "constant": boolean;
    "inputs": {
        "name": string;
        "type": string;
    }[];
    "name": string;
    "outputs": {
        "name": string;
        "type": string;
    }[];
    "payable": boolean;
    "type": string;
    "anonymous"?: undefined;
} | {
    "inputs": {
        "name": string;
        "type": string;
    }[];
    "type": string;
    "constant"?: undefined;
    "name"?: undefined;
    "outputs"?: undefined;
    "payable"?: undefined;
    "anonymous"?: undefined;
} | {
    "payable": boolean;
    "type": string;
    "constant"?: undefined;
    "inputs"?: undefined;
    "name"?: undefined;
    "outputs"?: undefined;
    "anonymous"?: undefined;
} | {
    "anonymous": boolean;
    "inputs": {
        "indexed": boolean;
        "name": string;
        "type": string;
    }[];
    "name": string;
    "type": string;
    "constant"?: undefined;
    "outputs"?: undefined;
    "payable"?: undefined;
})[];
