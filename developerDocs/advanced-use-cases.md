---
title: Advanced Use Cases
category: 64cbb5277b5f3c0065d96616
slug: opensea-sdk-advanced-use
parentDocSlug: opensea-sdk
order: 2
hidden: false
---

- [Scheduling Future Listings](#scheduling-future-listings)
- [Purchasing Items for Other Users](#purchasing-items-for-other-users)
- [Private Orders](#private-orders)
- [Canceling Orders](#canceling-orders)
- [Bulk Transfers](#bulk-transfers)
- [Listening to Events](#listening-to-events)

## Advanced

Interested in purchasing for users server-side or with a bot, scheduling future orders, or making bids in different ERC-20 tokens? OpenSea.js can help with that.

### Scheduling Future Listings

You can create listings that aren't fulfillable until a future date. Just pass in a `listingTime` (a UTC timestamp in seconds) to your SDK instance:

```typescript
const listingTime = Math.round(Date.now() / 1000 + 60 * 60 * 24); // One day from now
const order = await openseaSDK.createListing({
  asset: { tokenAddress, tokenId },
  accountAddress,
  startAmount: 1,
  listingTime,
});
```

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
  startAmount: 10,
  buyerAddress,
});
```

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
