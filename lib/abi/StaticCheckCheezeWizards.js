"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticCheckCheezeWizards = void 0;
exports.StaticCheckCheezeWizards = [
    {
        constant: true,
        inputs: [
            { name: "_wizardId", type: "uint256" },
            { name: "_fingerprint", type: "bytes32" },
            { name: "checkTxOrigin", type: "bool" },
        ],
        name: "succeedIfCurrentWizardFingerprintMatchesProvidedWizardFingerprint",
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
        constant: false,
        inputs: [{ name: "_newOpenSeaAdminAddress", type: "address" }],
        name: "changeOpenSeaAdminAddress",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [{ name: "_newTournamentAddress", type: "address" }],
        name: "changeTournamentAddress",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
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
        inputs: [{ name: "newOwner", type: "address" }],
        name: "transferOwnership",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            { name: "_cheezeWizardTournamentAddress", type: "address" },
            { name: "_openSeaAdminAddress", type: "address" },
        ],
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
//# sourceMappingURL=StaticCheckCheezeWizards.js.map