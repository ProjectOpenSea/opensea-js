---
title: Advanced Use Cases
category: 64cbb5277b5f3c0065d96616
slug: opensea-sdk-advanced-use
parentDocSlug: opensea-sdk
order: 2
hidden: false
---

> 📖 **For a complete reference of all SDK methods with detailed parameters and return types, see the [API Reference](api-reference.md).**

- [Purchasing Items for Other Users](#purchasing-items-for-other-users)
- [Private Orders](#private-orders)
- [Canceling Orders](#canceling-orders)
- [Bulk Order Creation](#bulk-order-creation)
- [Bulk Transfers](#bulk-transfers)
- [Listening to Events](#listening-to-events)

## Advanced

Interested in purchasing for users server-side or with a bot, scheduling future orders, or making bids in different ERC-20 tokens? OpenSea.js can help with that.

### Purchasing Items for Other Users

You can buy and transfer an item to someone else in one step! Just pass the `recipientAddress` parameter:

```typescript
const order = await openseaSDK.api.getOrder({ side: OrderSide.LISTING, ... })
await openseaSDK.fulfillOrder({
  order,
  accountAddress, // The address of your wallet, which will sign the transaction
  recipientAddress // The address of the recipient, i.e. the wallet you're purchasing on behalf of
})
```

If the order is a listing (sell order, ask, `OrderSide.LISTING`), the taker is the _buyer_ and this will prompt the buyer to pay for the item(s) but send them to the `recipientAddress`. If the order is an offer (buy order, bid, `OrderSide.OFFER`), the taker is the _seller_ but the bid amount will be sent to the `recipientAddress`.

This will automatically approve the assets for trading and confirm the transaction for sending them.

### Private Orders

You can make offers and listings that can only be fulfilled by an address or email of your choosing. This allows you to negotiate a price in some channel and sell for your chosen price on OpenSea, **without having to trust that the counterparty will abide by your terms!**

Here's an example of listing a Decentraland parcel for 10 ETH with a specific buyer address allowed to take it. No more needing to worry about whether they'll give you enough back!

```typescript
// Address allowed to buy from you
const buyerAddress = "0x123...";
// Decentraland
const tokenAddress = "0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d";
const tokenId =
  "115792089237316195423570985008687907832853042650384256231655107562007036952461";

const listing = await openseaSDK.createListing({
  tokenAddress,
  tokenId,
  accountAddress: OWNERS_WALLET_ADDRESS,
  amount: 10,
  buyerAddress,
});
```

**Important**  
> Private orders only restrict the taker address at the contract level. The order data remains public and discoverable via OpenSea APIs and on-chain indexers.

### Canceling Orders

The SDK provides flexible options for canceling orders both onchain and offchain.

#### Onchain Order Cancellation

The SDK provides two methods for onchain order cancellation:

**Cancel a Single Order**

Use `cancelOrder()` to cancel a single order. This method accepts either:

- A full `OrderV2` object from the API
- Just an order hash (automatically fetches full order data)

```typescript
// Cancel using order hash (automatically fetches from API)
await openseaSDK.cancelOrder({
  orderHash: "0x123...",
  accountAddress: "0x...",
  protocolAddress: "0x00000000000000adc04c56bf30ac9d3c0aaf14dc", // Seaport address
});

// Cancel using full OrderV2 object
const order = await openseaSDK.api.getOrder({ side: OrderSide.LISTING, ... });
await openseaSDK.cancelOrder({
  order,
  accountAddress: "0x...",
});
```

**Cancel Multiple Orders**

Use `cancelOrders()` to cancel multiple orders in a single transaction. This method accepts:

- Full `OrderV2` objects from the API
- Lightweight `OrderComponents`
- Just order hashes (automatically fetches full order data)

```typescript
// Cancel using order hashes (automatically fetches from API)
await openseaSDK.cancelOrders({
  orderHashes: ["0x123...", "0x456...", "0x789..."],
  accountAddress: "0x...",
  protocolAddress: "0x00000000000000adc04c56bf30ac9d3c0aaf14dc", // Seaport address
});

// Cancel using full OrderV2 objects
const orders = await openseaSDK.api.getOrders({ maker: accountAddress });
await openseaSDK.cancelOrders({
  orders: orders.orders.slice(0, 3),
  accountAddress: "0x...",
});
```

When providing order hashes, the SDK automatically fetches the full order data from the OpenSea API, making it easier to cancel orders without manually fetching order details first.

#### Offchain Order Cancellation

For orders protected by SignedZone, you can cancel them offchain (no gas required):

```typescript
await openseaSDK.offchainCancelOrder(
  protocolAddress,
  orderHash,
  chain,
  offererSignature, // Optional: derived from signer if not provided
);
```

Offchain cancellation is:

- **Gas-free**: No transaction fees
- **Instant**: No waiting for block confirmation
- **Limited**: Only works for SignedZone-protected orders
- **Authentication**: If `offererSignature` is not provided, the API key used to initialize the SDK must belong to the order's offerer
- **Note**: Cancellation is only assured if no fulfillment signature was vended before cancellation

### Bulk Order Creation

The SDK provides efficient methods for creating multiple listings or offers with a single signature using Seaport's bulk order functionality. This is significantly more gas-efficient and faster than creating orders individually.

#### Creating Multiple Listings

Use `createBulkListings()` to create multiple listings with a single signature:

```typescript
import { getUnixTimestampInSeconds, TimeInSeconds } from "opensea-js";

const listings = await openseaSDK.createBulkListings({
  listings: [
    {
      asset: { tokenAddress: "0x...", tokenId: "1" },
      amount: "1.5", // Price in ETH
    },
    {
      asset: { tokenAddress: "0x...", tokenId: "2" },
      amount: "2.0",
      expirationTime: getUnixTimestampInSeconds(TimeInSeconds.WEEK), // 7 days
    },
    {
      asset: { tokenAddress: "0x...", tokenId: "3" },
      amount: "0.5",
      paymentTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    },
  ],
  accountAddress: "0x...",
});
```

**Key Features:**

- **Single signature**: All listings are signed together using Seaport's merkle tree signature
- **Individual customization**: Each listing can have different prices, payment tokens, expiration times, etc.
- **Automatic rate limiting**: API submissions are handled sequentially with automatic retry on rate limits
- **Efficient**: Uses normal signature for single listing to avoid bulk signature overhead

**Performance Note:** If you only provide one listing, the method automatically uses `createListing()` internally since bulk signatures are more expensive to decode on-chain.

#### Creating Multiple Offers

Use `createBulkOffers()` to create multiple offers with a single signature:

```typescript
import { getUnixTimestampInSeconds, TimeInSeconds } from "opensea-js";

const offers = await openseaSDK.createBulkOffers({
  offers: [
    {
      asset: { tokenAddress: "0x...", tokenId: "1" },
      amount: "0.8", // Offer price in WETH
    },
    {
      asset: { tokenAddress: "0x...", tokenId: "2" },
      amount: "1.2",
      expirationTime: getUnixTimestampInSeconds(TimeInSeconds.DAY), // 1 day
    },
    {
      asset: { tokenAddress: "0x...", tokenId: "3" },
      amount: "2.5",
      paymentTokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      quantity: 5, // For ERC1155 tokens
    },
  ],
  accountAddress: "0x...",
});
```

**Key Features:**

- **Single signature**: All offers are signed together
- **Flexible payment tokens**: Each offer can use different ERC20 tokens
- **Automatic zone handling**: Uses signed zone for offer protection by default
- **Collection requirements**: Automatically applies collection-required zones when needed

#### Error Handling in Bulk Operations

By default, bulk operations will throw an error if any order fails to submit. Use `continueOnError: true` to attempt all orders:

```typescript
const result = await openseaSDK.createBulkListings({
  listings: [
    { asset: { tokenAddress: "0x...", tokenId: "1" }, amount: "1.5" },
    { asset: { tokenAddress: "0x...", tokenId: "2" }, amount: "2.0" },
    { asset: { tokenAddress: "0x...", tokenId: "3" }, amount: "0.5" },
  ],
  accountAddress: "0x...",
  continueOnError: true, // Continue even if some fail
  onProgress: (completed, total) => {
    console.log(`${completed}/${total} orders processed`);
  },
});

console.log(`✅ ${result.successful.length} orders created`);
console.log(`❌ ${result.failed.length} orders failed`);

// Handle failures
result.failed.forEach(({ index, error }) => {
  console.error(`Order ${index} failed:`, error.message);
});
```

**Progress Tracking:**

The `onProgress` callback is invoked after each order is processed (whether successful or failed), allowing you to update UI progress indicators during long-running bulk operations.

**Common Parameters for Both Methods:**

Each listing or offer in the bulk array supports:

- `asset`: The NFT to list/offer on (required)
  - `tokenAddress`: Contract address (required)
  - `tokenId`: Token ID (required)
- `amount`: Price in token units (required)
- `quantity`: Number of items (default: 1, for semi-fungible tokens)
- `expirationTime`: When the order expires in Unix seconds
- `paymentTokenAddress`: ERC20 token address (defaults to ETH for listings, WETH for offers)
- `domain`: Domain for order attribution
- `salt`: Custom salt for the order
- `buyerAddress`: For private listings only
- `includeOptionalCreatorFees`: Include optional creator fees (listings only)
- `zone`: Custom zone address

**Automatic Rate Limiting:**

All OpenSea API calls in the SDK include automatic rate limit handling with exponential backoff. If the API rate limits your requests (429/599 status codes), the SDK will:

1. Log the rate limit encounter with retry delay
2. Wait for the specified delay (respects `retry-after` header when present)
3. Retry the failed request (up to 3 times by default)
4. Continue with the operation

This applies to all API operations, not just bulk orders. If a request fails after all retries, the operation will throw an error.

**Example with All Options:**

```typescript
import { getUnixTimestampInSeconds, TimeInSeconds } from "opensea-js";

const listings = await openseaSDK.createBulkListings({
  listings: [
    {
      asset: { tokenAddress: "0x...", tokenId: "1" },
      amount: "1.5",
      quantity: 1,
      expirationTime: getUnixTimestampInSeconds(TimeInSeconds.MONTH), // 30 days
      paymentTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      domain: "mymarketplace.com",
      includeOptionalCreatorFees: true,
    },
    {
      asset: { tokenAddress: "0x...", tokenId: "2" },
      amount: "2.0",
      buyerAddress: "0xSpecificBuyer...", // Private listing
    },
  ],
  accountAddress: "0x...",
});
```

### Bulk Transfers

The SDK provides gas-efficient methods for transferring multiple assets in a single transaction using OpenSea's TransferHelper contract.

#### Batch Approving Assets

Before transferring assets, you need to approve them for transfer to the OpenSea conduit. The `batchApproveAssets()` method intelligently batches multiple approval transactions:

```typescript
// Approve multiple assets in a single transaction
const txHash = await openseaSDK.batchApproveAssets({
  assets: [
    {
      asset: {
        tokenAddress: "0x...",
        tokenId: "1",
        tokenStandard: TokenStandard.ERC721,
      },
    },
    {
      asset: {
        tokenAddress: "0x...",
        tokenId: "2",
        tokenStandard: TokenStandard.ERC1155,
      },
      amount: "10",
    },
  ],
  fromAddress: accountAddress,
});
```

The method uses intelligent batching:

- **0 approvals needed**: Returns `undefined` (no transaction)
- **1 approval needed**: Sends a single direct approval
- **2+ approvals needed**: Uses Multicall3 to batch all approvals in one transaction

This is significantly more gas-efficient than approving each asset separately.

#### Bulk Transfer

After assets are approved, use `bulkTransfer()` to transfer multiple assets to different recipients:

```typescript
const txHash = await openseaSDK.bulkTransfer({
  assets: [
    {
      asset: {
        tokenAddress: "0x...",
        tokenId: "1",
        tokenStandard: TokenStandard.ERC721,
      },
      toAddress: "0xrecipient1...",
    },
    {
      asset: {
        tokenAddress: "0x...",
        tokenId: "2",
        tokenStandard: TokenStandard.ERC1155,
      },
      toAddress: "0xrecipient2...",
      amount: "5",
    },
    {
      asset: {
        tokenAddress: "0x...", // ERC20 token
        tokenStandard: TokenStandard.ERC20,
      },
      toAddress: "0xrecipient3...",
      amount: "1000000000000000000", // 1 token in wei
    },
  ],
  fromAddress: accountAddress,
});
```

**Important notes:**

- All assets must be approved before calling `bulkTransfer()`
- If any asset is not approved, the method will throw a helpful error message suggesting you use `batchApproveAssets()`
- Supports ERC20, ERC721, and ERC1155 tokens
- Each asset can be sent to a different recipient

### Listening to Events

Events are fired whenever transactions or orders are being created, and when transactions return receipts from recently mined blocks on the Ethereum blockchain.

Our recommendation is that you "forward" OpenSea events to your own store or state management system. Here are examples of listening to the events:

```typescript
import { OpenSeaSDK, EventType } from 'opensea-js'
const sdk = new OpenSeaSDK(...);

handleSDKEvents() {
    sdk.addListener(EventType.TransactionCreated, ({ transactionHash, event }) => {
      console.info('Transaction created: ', { transactionHash, event })
    })
    sdk.addListener(EventType.TransactionConfirmed, ({ transactionHash, event }) => {
      console.info('Transaction confirmed: ',{ transactionHash, event })
    })
    sdk.addListener(EventType.TransactionDenied, ({ transactionHash, event }) => {
      console.info('Transaction denied: ',{ transactionHash, event })
    })
    sdk.addListener(EventType.TransactionFailed, ({ transactionHash, event }) => {
      console.info('Transaction failed: ',{ transactionHash, event })
    })
    sdk.addListener(EventType.WrapEth, ({ accountAddress, amount }) => {
      console.info('Wrap ETH: ',{ accountAddress, amount })
    })
    sdk.addListener(EventType.UnwrapWeth, ({ accountAddress, amount }) => {
      console.info('Unwrap ETH: ',{ accountAddress, amount })
    })
    sdk.addListener(EventType.MatchOrders, ({ buy, sell, accountAddress }) => {
      console.info('Match orders: ', { buy, sell, accountAddress })
    })
    sdk.addListener(EventType.CancelOrder, ({ order, accountAddress }) => {
      console.info('Cancel order: ', { order, accountAddress })
    })
}
```

To remove all listeners call `sdk.removeAllListeners()`.
