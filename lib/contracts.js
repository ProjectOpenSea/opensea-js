export var getMethod = function (abi, name) {
    var methodAbi = abi.find(function (x) { return x.type == "function" && x.name == name; });
    if (!methodAbi) {
        throw new Error("ABI ".concat(name, " not found"));
    }
    // Have to cast since there's a bug in
    // web3 types on the 'type' field
    return methodAbi;
};
export { ERC20 } from "./abi/ERC20";
export { ERC721 } from "./abi/ERC721v3";
export { ERC1155 } from "./abi/ERC1155";
export { StaticCheckTxOrigin } from "./abi/StaticCheckTxOrigin";
export { StaticCheckCheezeWizards } from "./abi/StaticCheckCheezeWizards";
export { StaticCheckDecentralandEstates } from "./abi/StaticCheckDecentralandEstates";
export { CheezeWizardsBasicTournament } from "./abi/CheezeWizardsBasicTournament";
export { DecentralandEstates } from "./abi/DecentralandEstates";
export { CanonicalWETH } from "./abi/CanonicalWETH";
export { WrappedNFT } from "./abi/WrappedNFT";
export { WrappedNFTFactory } from "./abi/WrappedNFTFactory";
export { WrappedNFTLiquidationProxy } from "./abi/WrappedNFTLiquidationProxy";
export { UniswapFactory } from "./abi/UniswapFactory";
export { UniswapExchange } from "./abi/UniswapExchange";
export { WyvernFeeWrapper } from "./abi/WyvernFeeWrapper";
//# sourceMappingURL=contracts.js.map