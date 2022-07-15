"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrappedNFTLiquidationProxy = void 0;
exports.WrappedNFTLiquidationProxy = [
    {
        constant: false,
        inputs: [
            { name: "_operator", type: "address" },
            { name: "_from", type: "address" },
            { name: "_tokenId", type: "uint256" },
            { name: "_data", type: "bytes" },
        ],
        name: "onERC721Received",
        outputs: [{ name: "", type: "bytes4" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { name: "_nftIds", type: "uint256[]" },
            { name: "_nftContractAddresses", type: "address[]" },
            { name: "_isMixedBatchOfNFTs", type: "bool" },
        ],
        name: "wrapNFTs",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "uniswapFactoryAddress",
        outputs: [{ name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "wrappedNFTFactoryAddress",
        outputs: [{ name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { name: "_nftContractAddress", type: "address" },
            { name: "_numTokensToPurchase", type: "uint256" },
        ],
        name: "purchaseNFTs",
        outputs: [],
        payable: true,
        stateMutability: "payable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { name: "_nftIds", type: "uint256[]" },
            { name: "_nftContractAddresses", type: "address[]" },
            { name: "_isMixedBatchOfNFTs", type: "bool" },
            { name: "_uniswapSlippageAllowedInBasisPoints", type: "uint256" },
        ],
        name: "liquidateNFTs",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            { name: "_nftIds", type: "uint256[]" },
            { name: "_nftContractAddresses", type: "address[]" },
            { name: "_destinationAddresses", type: "address[]" },
            { name: "_isMixedBatchOfNFTs", type: "bool" },
        ],
        name: "unwrapNFTs",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "_wrappedNFTFactoryAddress", type: "address" },
            { name: "_uniswapFactoryAddress", type: "address" },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor",
    },
    { payable: true, stateMutability: "payable", type: "fallback" },
    {
        anonymous: false,
        inputs: [
            { indexed: false, name: "numTokensMelted", type: "uint256" },
            { indexed: false, name: "nftContractAddress", type: "address" },
            { indexed: false, name: "ethReceived", type: "uint256" },
        ],
        name: "LiquidateNFTs",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, name: "numTokensBought", type: "uint256" },
            { indexed: false, name: "nftContractAddress", type: "address" },
            { indexed: false, name: "ethSpent", type: "uint256" },
        ],
        name: "PurchaseNFTs",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, name: "numTokensWrapped", type: "uint256" },
            { indexed: false, name: "nftContractAddress", type: "address" },
        ],
        name: "WrapNFTs",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, name: "numTokensUnwrapped", type: "uint256" },
            { indexed: false, name: "nftContractAddress", type: "address" },
        ],
        name: "UnwrapNFTs",
        type: "event",
    },
];
//# sourceMappingURL=WrappedNFTLiquidationProxy.js.map