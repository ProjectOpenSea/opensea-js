export var ERC1155 = [
    {
        payable: false,
        stateMutability: "nonpayable",
        type: "fallback",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_owner",
                type: "address",
            },
            {
                indexed: true,
                name: "_spender",
                type: "address",
            },
            {
                indexed: false,
                name: "_value",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "_block",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_storage",
                type: "address",
            },
            {
                indexed: false,
                name: "_oldContract",
                type: "address",
            },
        ],
        name: "Initialize",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                name: "_block",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_nextContract",
                type: "address",
            },
        ],
        name: "Retire",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_from",
                type: "address",
            },
            {
                indexed: false,
                name: "_data",
                type: "string",
            },
        ],
        name: "Log",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
        ],
        name: "UpdateDecimals",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
        ],
        name: "UpdateName",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
        ],
        name: "UpdateSymbol",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_uri",
                type: "string",
            },
        ],
        name: "SetURI",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_from",
                type: "address",
            },
            {
                indexed: true,
                name: "_to",
                type: "address",
            },
        ],
        name: "Assign",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_creator",
                type: "address",
            },
        ],
        name: "AcceptAssignment",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_creator",
                type: "address",
            },
            {
                indexed: false,
                name: "_isNonFungible",
                type: "bool",
            },
        ],
        name: "Create",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_value",
                type: "uint256",
            },
        ],
        name: "Mint",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
        ],
        name: "UpdateMaxMeltFee",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
        ],
        name: "UpdateMeltFee",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_owner",
                type: "address",
            },
            {
                indexed: true,
                name: "_operator",
                type: "address",
            },
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_approved",
                type: "bool",
            },
        ],
        name: "OperatorApproval",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_from",
                type: "address",
            },
            {
                indexed: true,
                name: "_to",
                type: "address",
            },
            {
                indexed: false,
                name: "_value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_sender",
                type: "address",
            },
            {
                indexed: true,
                name: "_feeId",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_feeValue",
                type: "uint256",
            },
        ],
        name: "TransferFee",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
        ],
        name: "UpdateMaxTransferFee",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
        ],
        name: "UpdateTransferable",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
        ],
        name: "UpdateTransferFee",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_account",
                type: "address",
            },
            {
                indexed: false,
                name: "_whitelisted",
                type: "address",
            },
            {
                indexed: false,
                name: "_on",
                type: "bool",
            },
        ],
        name: "Whitelist",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_owner",
                type: "address",
            },
            {
                indexed: false,
                name: "_value",
                type: "uint256",
            },
        ],
        name: "Melt",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_id",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_sender",
                type: "address",
            },
        ],
        name: "DeployERCAdapter",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_tradeId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_firstParty",
                type: "address",
            },
            {
                indexed: true,
                name: "_secondParty",
                type: "address",
            },
            {
                indexed: false,
                name: "_escrowedEnjFirstParty",
                type: "uint256",
            },
        ],
        name: "CreateTrade",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_tradeId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_firstParty",
                type: "address",
            },
            {
                indexed: true,
                name: "_secondParty",
                type: "address",
            },
            {
                indexed: false,
                name: "_receivedEnjFirstParty",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_changeEnjFirstParty",
                type: "uint256",
            },
            {
                indexed: false,
                name: "_receivedEnjSecondParty",
                type: "uint256",
            },
        ],
        name: "CompleteTrade",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_tradeId",
                type: "uint256",
            },
            {
                indexed: true,
                name: "_firstParty",
                type: "address",
            },
            {
                indexed: false,
                name: "_receivedEnjFirstParty",
                type: "uint256",
            },
        ],
        name: "CancelTrade",
        type: "event",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_interfaceID",
                type: "bytes4",
            },
        ],
        name: "supportsInterface",
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "pure",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_name",
                type: "string",
            },
            {
                name: "_totalSupply",
                type: "uint256",
            },
            {
                name: "_initialReserve",
                type: "uint256",
            },
            {
                name: "_supplyModel",
                type: "address",
            },
            {
                name: "_meltValue",
                type: "uint256",
            },
            {
                name: "_meltFeeRatio",
                type: "uint16",
            },
            {
                name: "_transferable",
                type: "uint8",
            },
            {
                name: "_transferFeeSettings",
                type: "uint256[3]",
            },
            {
                name: "_nonFungible",
                type: "bool",
            },
        ],
        name: "create",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_initialReserve",
                type: "uint256",
            },
        ],
        name: "minMeltValue",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_to",
                type: "address[]",
            },
            {
                name: "_values",
                type: "uint256[]",
            },
        ],
        name: "mintFungibles",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_to",
                type: "address[]",
            },
        ],
        name: "mintNonFungibles",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_to",
                type: "address[]",
            },
            {
                name: "_data",
                type: "uint128[]",
            },
        ],
        name: "mintNonFungiblesWithData",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "reserve",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint128",
            },
        ],
        name: "releaseReserve",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_name",
                type: "string",
            },
        ],
        name: "updateName",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_creator",
                type: "address",
            },
        ],
        name: "assign",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "acceptAssignment",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_account",
                type: "address",
            },
            {
                name: "_whitelisted",
                type: "address",
            },
            {
                name: "_on",
                type: "bool",
            },
        ],
        name: "setWhitelisted",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_transferable",
                type: "uint8",
            },
        ],
        name: "setTransferable",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_fee",
                type: "uint16",
            },
        ],
        name: "setMeltFee",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_fee",
                type: "uint16",
            },
        ],
        name: "decreaseMaxMeltFee",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_fee",
                type: "uint256",
            },
        ],
        name: "setTransferFee",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_fee",
                type: "uint256",
            },
        ],
        name: "decreaseMaxTransferFee",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_decimals",
                type: "uint8",
            },
            {
                name: "_symbol",
                type: "string",
            },
        ],
        name: "deployERC20Adapter",
        outputs: [
            {
                name: "",
                type: "address",
            },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_symbol",
                type: "string",
            },
        ],
        name: "deployERC721Adapter",
        outputs: [
            {
                name: "",
                type: "address",
            },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_data",
                type: "string",
            },
        ],
        name: "addLog",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "typeCount",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_index",
                type: "uint256",
            },
        ],
        name: "typeByIndex",
        outputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "nonFungibleTypeCount",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_index",
                type: "uint256",
            },
        ],
        name: "nonFungibleTypeByIndex",
        outputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "fungibleTypeCount",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_index",
                type: "uint256",
            },
        ],
        name: "fungibleTypeByIndex",
        outputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "typeData",
        outputs: [
            {
                name: "_name",
                type: "string",
            },
            {
                name: "_creator",
                type: "address",
            },
            {
                name: "_meltValue",
                type: "uint256",
            },
            {
                name: "_meltFeeRatio",
                type: "uint16",
            },
            {
                name: "_meltFeeMaxRatio",
                type: "uint16",
            },
            {
                name: "_supplyModel",
                type: "address",
            },
            {
                name: "_totalSupply",
                type: "uint256",
            },
            {
                name: "_circulatingSupply",
                type: "uint256",
            },
            {
                name: "_reserve",
                type: "uint256",
            },
            {
                name: "_transferable",
                type: "uint8",
            },
            {
                name: "_transferFeeData",
                type: "uint256[4]",
            },
            {
                name: "_nonFungible",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "transferSettings",
        outputs: [
            {
                name: "_transferable",
                type: "uint8",
            },
            {
                name: "_transferFeeType",
                type: "uint8",
            },
            {
                name: "_transferFeeCurrency",
                type: "uint256",
            },
            {
                name: "_transferFeeValue",
                type: "uint256",
            },
            {
                name: "_transferFeeMaxValue",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_creator",
                type: "address",
            },
        ],
        name: "isCreatorOf",
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_account",
                type: "address",
            },
            {
                name: "_whitelisted",
                type: "address",
            },
        ],
        name: "whitelisted",
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "name",
        outputs: [
            {
                name: "",
                type: "string",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "totalSupply",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "mintableSupply",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "circulatingSupply",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_owner",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "decimals",
        outputs: [
            {
                name: "",
                type: "uint8",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "symbol",
        outputs: [
            {
                name: "",
                type: "string",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "getERC20Adapter",
        outputs: [
            {
                name: "",
                type: "address",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "getERC721Adapter",
        outputs: [
            {
                name: "",
                type: "address",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "transfer",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint256",
            },
            {
                name: "_data",
                type: "bytes",
            },
        ],
        name: "safeTransfer",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint256",
            },
            {
                name: "_msgSender",
                type: "address",
            },
        ],
        name: "transferAdapter",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_from",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "transferFrom",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_from",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint256",
            },
            {
                name: "_data",
                type: "bytes",
            },
        ],
        name: "safeTransferFrom",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_from",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint256",
            },
            {
                name: "_msgSender",
                type: "address",
            },
        ],
        name: "transferFromAdapter",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_ids",
                type: "uint256[]",
            },
            {
                name: "_values",
                type: "uint256[]",
            },
        ],
        name: "batchTransfer",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_ids",
                type: "uint256[]",
            },
            {
                name: "_values",
                type: "uint256[]",
            },
            {
                name: "_data",
                type: "bytes",
            },
        ],
        name: "safeBatchTransfer",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_from",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_ids",
                type: "uint256[]",
            },
            {
                name: "_values",
                type: "uint256[]",
            },
        ],
        name: "batchTransferFrom",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_from",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_ids",
                type: "uint256[]",
            },
            {
                name: "_values",
                type: "uint256[]",
            },
            {
                name: "_data",
                type: "bytes",
            },
        ],
        name: "safeBatchTransferFrom",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address[]",
            },
            {
                name: "_ids",
                type: "uint256[]",
            },
            {
                name: "_values",
                type: "uint256[]",
            },
        ],
        name: "multicastTransfer",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address[]",
            },
            {
                name: "_ids",
                type: "uint256[]",
            },
            {
                name: "_values",
                type: "uint256[]",
            },
            {
                name: "_data",
                type: "bytes",
            },
        ],
        name: "safeMulticastTransfer",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_from",
                type: "address[]",
            },
            {
                name: "_to",
                type: "address[]",
            },
            {
                name: "_ids",
                type: "uint256[]",
            },
            {
                name: "_values",
                type: "uint256[]",
            },
        ],
        name: "multicastTransferFrom",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_owner",
                type: "address",
            },
            {
                name: "_spender",
                type: "address",
            },
        ],
        name: "allowance",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_spender",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_currentValue",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_spender",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_currentValue",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint256",
            },
            {
                name: "_msgSender",
                type: "address",
            },
        ],
        name: "approveAdapter",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_spender",
                type: "address",
            },
            {
                name: "_ids",
                type: "uint256[]",
            },
            {
                name: "_currentValues",
                type: "uint256[]",
            },
            {
                name: "_values",
                type: "uint256[]",
            },
        ],
        name: "batchApprove",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_operator",
                type: "address",
            },
            {
                name: "_ids",
                type: "uint256[]",
            },
            {
                name: "_approved",
                type: "bool",
            },
        ],
        name: "setApproval",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_operator",
                type: "address",
            },
            {
                name: "_approved",
                type: "bool",
            },
        ],
        name: "setApprovalForAll",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_operator",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_approved",
                type: "bool",
            },
            {
                name: "_msgSender",
                type: "address",
            },
        ],
        name: "setApprovalAdapter",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_owner",
                type: "address",
            },
            {
                name: "_operator",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "isApproved",
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_owner",
                type: "address",
            },
            {
                name: "_operator",
                type: "address",
            },
        ],
        name: "isApprovedForAll",
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint256",
            },
            {
                name: "_from",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
        ],
        name: "transferFees",
        outputs: [
            {
                name: "_transferValue",
                type: "uint256",
            },
            {
                name: "_minTransferValue",
                type: "uint256",
            },
            {
                name: "_transferFeeCurrency",
                type: "uint256",
            },
            {
                name: "_fee",
                type: "uint256",
            },
            {
                name: "_maxFee",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_askingIds",
                type: "uint256[]",
            },
            {
                name: "_askingValues",
                type: "uint128[]",
            },
            {
                name: "_offeringIds",
                type: "uint256[]",
            },
            {
                name: "_offeringValues",
                type: "uint128[]",
            },
            {
                name: "_secondParty",
                type: "address",
            },
        ],
        name: "createTrade",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "tradeCompletable",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "completeTrade",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "cancelTrade",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_ids",
                type: "uint256[]",
            },
            {
                name: "_values",
                type: "uint256[]",
            },
        ],
        name: "melt",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "ownerOf",
        outputs: [
            {
                name: "",
                type: "address",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_uri",
                type: "string",
            },
        ],
        name: "setURI",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "uri",
        outputs: [
            {
                name: "",
                type: "string",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "nonFungibleCount",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_index",
                type: "uint256",
            },
        ],
        name: "nonFungibleByIndex",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_owner",
                type: "address",
            },
            {
                name: "_index",
                type: "uint256",
            },
        ],
        name: "nonFungibleOfOwnerByIndex",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_id",
                type: "uint256",
            },
        ],
        name: "isNonFungible",
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "pure",
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_addr",
                type: "address",
            },
        ],
        name: "isContract",
        outputs: [
            {
                name: "",
                type: "bool",
            },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_erc20ContractAddress",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "releaseERC20",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "releaseETH",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_erc721ContractAddress",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_token",
                type: "uint256",
            },
        ],
        name: "releaseERC721",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_erc1155ContractAddress",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_id",
                type: "uint256",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "releaseERC1155",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_storage",
                type: "address",
            },
            {
                name: "_oldContract",
                type: "address",
            },
        ],
        name: "initialize",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_nextContract",
                type: "address",
            },
        ],
        name: "retire",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
];
//# sourceMappingURL=ERC1155.js.map