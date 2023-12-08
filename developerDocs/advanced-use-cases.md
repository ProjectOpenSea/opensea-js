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
- [Using ERC-20 Tokens Instead of Ether](#using-erc-20-tokens-instead-of-ether)
- [Private Auctions](#private-auctions)
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
const order = await openseaSDK.api.getOrder({ side: OrderSide.ASK, ... })
await openseaSDK.fulfillOrder({
  order,
  accountAddress, // The address of your wallet, which will sign the transaction
  recipientAddress // The address of the recipient, i.e. the wallet you're purchasing on behalf of
})
```

If the order is a listing (sell order, `order.side === OrderSide.ASK`), the taker is the _buyer_ and this will prompt the buyer to pay for the item(s) but send them to the `recipientAddress`. If the order is an offer (buy order, `"bid"`), the taker is the _seller_ but the bid amount be sent to the `recipientAddress`.

This will automatically approve the assets for trading and confirm the transaction for sending them.

### Using ERC-20 Tokens Instead of Ether

Here's an example of listing the Genesis CryptoKitty for $100! No more needing to worry about the exchange rate:

```typescript
// CryptoKitties
const tokenAddress = "0x06012c8cf97bead5deae237070f9587f8e7a266d";
// Token address for the DAI stablecoin, which is pegged to $1 USD
const paymentTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

// The units for `startAmount` and `endAmount` are now in DAI, so $100 USD
const order = await openseaSDK.createListing({
  tokenAddress,
  tokenId: "1",
  accountAddress: OWNERS_WALLET_ADDRESS,
  startAmount: 100,
  paymentTokenAddress,
});
```

You can use `getPaymentToken` to search for payment tokens by address. And you can even list all orders for a specific ERC-20 token by querying the API:

```typescript
const token = await openseaSDK.api.getPaymentToken(paymentTokenAddress);

const order = await openseaSDK.api.getOrders({
  side: OrderSide.ASK,
  paymentTokenAddress: token.address,
});
```

### Private Auctions

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
