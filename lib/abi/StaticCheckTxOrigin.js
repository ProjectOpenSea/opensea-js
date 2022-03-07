"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticCheckTxOrigin = void 0;
exports.StaticCheckTxOrigin = [
    {
        constant: true,
        inputs: [],
        name: "succeedIfTxOriginMatchesHardcodedAddress",
        outputs: [],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [{ name: "_specifiedAddress", type: "address" }],
        name: "succeedIfTxOriginMatchesSpecifiedAddress",
        outputs: [],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "owner",
        outputs: [{ name: "", type: "address" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "isOwner",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [{ name: "_newHardcodedAddress", type: "address" }],
        name: "changeHardcodedAddress",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [{ name: "newOwner", type: "address" }],
        name: "transferOwnership",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [{ name: "_hardcodedAddress", type: "address" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        anonymous: false,
        inputs: [
            { indexed: false, name: "previousOwner", type: "address" },
            { indexed: false, name: "newOwner", type: "address" },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
];
//# sourceMappingURL=StaticCheckTxOrigin.js.map