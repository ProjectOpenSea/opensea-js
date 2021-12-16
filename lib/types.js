import { Network, HowToCall, } from "wyvern-js/lib/types";
export { HowToCall, Network };
/**
 * Events emitted by the SDK. There are five types:
 * 1. Transaction events, which tell you when a new transaction was
 *    created, confirmed, denied, or failed.
 * 2. pre-transaction events, which are named (like "WrapEth") and indicate
 *    that Web3 is asking for a signature on a transaction that needs to occur before
 *    an order is made or fulfilled. This includes approval events and account
 *    initialization.
 * 3. Basic actions: matching, cancelling, and creating orders.
 *    The "CreateOrder" event fires when a signature is being prompted
 *    to create an off-chain order. The "OrderDenied" event fires when a signature
 *    request is denied by the user.
 * 4. The "TransferAll" event, which fires when a user is about to directly
 *    transfer one or more assets to another account
 */
export var EventType;
(function (EventType) {
    // Transactions and signature requests
    EventType["TransactionCreated"] = "TransactionCreated";
    EventType["TransactionConfirmed"] = "TransactionConfirmed";
    EventType["TransactionDenied"] = "TransactionDenied";
    EventType["TransactionFailed"] = "TransactionFailed";
    // Pre-transaction events
    EventType["InitializeAccount"] = "InitializeAccount";
    EventType["WrapEth"] = "WrapEth";
    EventType["UnwrapWeth"] = "UnwrapWeth";
    EventType["ApproveCurrency"] = "ApproveCurrency";
    EventType["ApproveAsset"] = "ApproveAsset";
    EventType["ApproveAllAssets"] = "ApproveAllAssets";
    EventType["UnapproveCurrency"] = "UnapproveCurrency";
    // Basic actions: matching orders, creating orders, and cancelling orders
    EventType["MatchOrders"] = "MatchOrders";
    EventType["CancelOrder"] = "CancelOrder";
    EventType["ApproveOrder"] = "ApproveOrder";
    EventType["CreateOrder"] = "CreateOrder";
    // When the signature request for an order is denied
    EventType["OrderDenied"] = "OrderDenied";
    // When transferring one or more assets
    EventType["TransferAll"] = "TransferAll";
    EventType["TransferOne"] = "TransferOne";
    // When wrapping or unwrapping NFTs
    EventType["WrapAssets"] = "WrapAssets";
    EventType["UnwrapAssets"] = "UnwrapAssets";
    EventType["LiquidateAssets"] = "LiquidateAssets";
    EventType["PurchaseAssets"] = "PurchaseAssets";
})(EventType || (EventType = {}));
/**
 * Wyvern order side: buy or sell.
 */
export var OrderSide;
(function (OrderSide) {
    OrderSide[OrderSide["Buy"] = 0] = "Buy";
    OrderSide[OrderSide["Sell"] = 1] = "Sell";
})(OrderSide || (OrderSide = {}));
/**
 * Wyvern fee method
 * ProtocolFee: Charge maker fee to seller and charge taker fee to buyer.
 * SplitFee: Maker fees are deducted from the token amount that the maker receives. Taker fees are extra tokens that must be paid by the taker.
 */
export var FeeMethod;
(function (FeeMethod) {
    FeeMethod[FeeMethod["ProtocolFee"] = 0] = "ProtocolFee";
    FeeMethod[FeeMethod["SplitFee"] = 1] = "SplitFee";
})(FeeMethod || (FeeMethod = {}));
/**
 * Wyvern: type of sale. Fixed or Dutch auction
 * Note: not imported from wyvern.js because it uses
 * EnglishAuction as 1 and DutchAuction as 2
 */
export var SaleKind;
(function (SaleKind) {
    SaleKind[SaleKind["FixedPrice"] = 0] = "FixedPrice";
    SaleKind[SaleKind["DutchAuction"] = 1] = "DutchAuction";
})(SaleKind || (SaleKind = {}));
/**
 * Types of asset contracts
 * Given by the asset_contract_type in the OpenSea API
 */
var AssetContractType;
(function (AssetContractType) {
    AssetContractType["Fungible"] = "fungible";
    AssetContractType["SemiFungible"] = "semi-fungible";
    AssetContractType["NonFungible"] = "non-fungible";
    AssetContractType["Unknown"] = "unknown";
})(AssetContractType || (AssetContractType = {}));
// Wyvern Schemas (see https://github.com/ProjectOpenSea/wyvern-schemas)
export var WyvernSchemaName;
(function (WyvernSchemaName) {
    WyvernSchemaName["ERC20"] = "ERC20";
    WyvernSchemaName["ERC721"] = "ERC721";
    WyvernSchemaName["ERC721v3"] = "ERC721v3";
    WyvernSchemaName["ERC1155"] = "ERC1155";
    WyvernSchemaName["LegacyEnjin"] = "Enjin";
    WyvernSchemaName["ENSShortNameAuction"] = "ENSShortNameAuction";
    // CryptoPunks = 'CryptoPunks'
})(WyvernSchemaName || (WyvernSchemaName = {}));
/**
 * The NFT version that this contract uses.
 * ERC721 versions are:
 * 1.0: CryptoKitties and early 721s, which lack approve-all and
 *      have problems calling `transferFrom` from the owner's account.
 * 2.0: CryptoSaga and others that lack `transferFrom` and have
 *      `takeOwnership` instead
 * 3.0: The current OpenZeppelin standard:
 *      https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC721/ERC721.sol
 * Special cases:
 * locked: When the transfer function has been locked by the dev
 */
export var TokenStandardVersion;
(function (TokenStandardVersion) {
    TokenStandardVersion["Unsupported"] = "unsupported";
    TokenStandardVersion["Locked"] = "locked";
    TokenStandardVersion["Enjin"] = "1155-1.0";
    TokenStandardVersion["ERC721v1"] = "1.0";
    TokenStandardVersion["ERC721v2"] = "2.0";
    TokenStandardVersion["ERC721v3"] = "3.0";
})(TokenStandardVersion || (TokenStandardVersion = {}));
/**
 * Defines set of possible auctions types
 */
var AuctionType;
(function (AuctionType) {
    AuctionType["Dutch"] = "dutch";
    AuctionType["English"] = "english";
    AuctionType["MinPrice"] = "min_price";
})(AuctionType || (AuctionType = {}));
/**
 * Defines the possible types of asset events that can take place
 */
var AssetEventType;
(function (AssetEventType) {
    AssetEventType["AuctionCreated"] = "created";
    AssetEventType["AuctionSuccessful"] = "successful";
    AssetEventType["AuctionCancelled"] = "cancelled";
    AssetEventType["OfferEntered"] = "offer_entered";
    AssetEventType["BidEntered"] = "bid_entered";
    AssetEventType["BidWithdraw"] = "bid_withdraw";
    AssetEventType["AssetTransfer"] = "transfer";
    AssetEventType["AssetApprove"] = "approve";
    AssetEventType["CompositionCreated"] = "composition_created";
    AssetEventType["Custom"] = "custom";
    AssetEventType["Payout"] = "payout";
})(AssetEventType || (AssetEventType = {}));
//# sourceMappingURL=types.js.map