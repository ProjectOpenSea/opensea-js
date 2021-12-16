export var proxyABI = {
    constant: false,
    inputs: [
        { name: "dest", type: "address" },
        { name: "howToCall", type: "uint8" },
        { name: "calldata", type: "bytes" },
    ],
    name: "proxy",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
};
export var proxyAssertABI = {
    constant: false,
    inputs: [
        { name: "dest", type: "address" },
        { name: "howToCall", type: "uint8" },
        { name: "calldata", type: "bytes" },
    ],
    name: "proxyAssert",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
};
//# sourceMappingURL=Proxy.js.map