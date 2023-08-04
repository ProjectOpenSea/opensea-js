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

You can create sell orders that aren't fulfillable until a future date. Just pass in a `listingTime` (a UTC timestamp in seconds) to your SDK instance:

```typescript
const auction = await openseaSDK.createSellOrder({
  tokenAddress,
  tokenId,
  accountAddress,
  startAmount: 1,
  listingTime: Math.round(Date.now() / 1000 + 60 * 60 * 24), // One day from now
});
```

### Purchasing Items for Other Users

You can buy and transfer an item to someone else in one step! Just pass the `recipientAddress` parameter:

```typescript
const order = await openseaSDK.api.getOrder({ side: "ask", ... })
await openseaSDK.fulfillOrder({
  order,
  accountAddress, // The address of your wallet, which will sign the transaction
  recipientAddress // The address of the recipient, i.e. the wallet you're purchasing on behalf of
})
```

If the order is a sell order (`order.side === "ask"`), the taker is the _buyer_ and this will prompt the buyer to pay for the item(s) but send them to the `recipientAddress`. If the order is a buy order ( `"bid"`), the taker is the _seller_ but the bid amount be sent to the `recipientAddress`.

This will automatically approve the assets for trading and confirm the transaction for sending them.

### Using ERC-20 Tokens Instead of Ether

Here's an example of listing the Genesis CryptoKitty for $100! No more needing to worry about the exchange rate:

```typescript
// Token address for the DAI stablecoin, which is pegged to $1 USD
const paymentTokenAddress = "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359";

// The units for `startAmount` and `endAmount` are now in DAI, so $100 USD
const auction = await openseaSDK.createSellOrder({
  tokenAddress: "0x06012c8cf97bead5deae237070f9587f8e7a266d", // CryptoKitties
  tokenId: "1", // Token ID
  accountAddress: OWNERS_WALLET_ADDRESS,
  startAmount: 100,
  paymentTokenAddress,
});
```

You can use `getPaymentTokens` to search for tokens by symbol name. And you can even list all orders for a specific ERC-20 token by querying the API:

```typescript
const token = (await openseaSDK.api.getPaymentTokens({ symbol: "MANA" }))
  .tokens[0];

const order = await openseaSDK.api.getOrders({
  side: "ask",
  paymentTokenAddress: token.address,
});
```

**Fun note:** soon, all ERC-20 tokens will be allowed! This will mean you can create crazy offers on crypto collectibles **using your own ERC-20 token**. However, opensea.io will only display offers and auctions in ERC-20 tokens that it knows about, optimizing the user experience of order takers. Orders made with the following tokens will be shown on OpenSea:

- MANA, Decentraland's currency: https://etherscan.io/token/0x0f5d2fb29fb7d3cfee444a200298f468908cc942
- DAI, Maker's stablecoin, pegged to $1 USD: https://etherscan.io/token/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359

### Private Auctions

Now you can make auctions and listings that can only be fulfilled by an address or email of your choosing. This allows you to negotiate a price in some channel and sell for your chosen price on OpenSea, **without having to trust that the counterparty will abide by your terms!**

Here's an example of listing a Decentraland parcel for 10 ETH with a specific buyer address allowed to take it. No more needing to worry about whether they'll give you enough back!

```typescript
// Address allowed to buy from you
const buyerAddress = "0x123...";

const listing = await openseaSDK.createSellOrder({
  tokenAddress: "0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d", // Decentraland
  tokenId:
    "115792089237316195423570985008687907832853042650384256231655107562007036952461", // Token ID
  accountAddress: OWNERS_WALLET_ADDRESS,
  startAmount: 10,
  buyerAddress,
});
```

### Listening to Events

Events are fired whenever transactions or orders are being created, and when transactions return receipts from recently mined blocks on the Ethereum blockchain.

Our recommendation is that you "forward" OpenSea events to your own store or state management system. Here's an example of doing that with a Redux action:

```typescript
import { openSeaSDK, EventType } from 'opensea-js'
import * as ActionTypes from './index'

// ...

handleSDKEvents() {
  return async function(dispatch, getState) {
    openSeaSDK.addListener(EventType.TransactionCreated, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      dispatch({ type: ActionTypes.SET_PENDING_TRANSACTION_HASH, hash: transactionHash })
    })
    openSeaSDK.addListener(EventType.TransactionConfirmed, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      // Only reset your exchange UI if we're finishing an order fulfillment or cancellation
      if (event == EventType.MatchOrders || event == EventType.CancelOrder) {
        dispatch({ type: ActionTypes.RESET_EXCHANGE })
      }
    })
    openSeaSDK.addListener(EventType.TransactionDenied, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      dispatch({ type: ActionTypes.RESET_EXCHANGE })
    })
    openSeaSDK.addListener(EventType.TransactionFailed, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      dispatch({ type: ActionTypes.RESET_EXCHANGE })
    })
    openSeaSDK.addListener(EventType.InitializeAccount, ({ accountAddress }) => {
      console.info({ accountAddress })
      dispatch({ type: ActionTypes.INITIALIZE_PROXY })
    })
    openSeaSDK.addListener(EventType.WrapEth, ({ accountAddress, amount }) => {
      console.info({ accountAddress, amount })
      dispatch({ type: ActionTypes.WRAP_ETH })
    })
    openSeaSDK.addListener(EventType.UnwrapWeth, ({ accountAddress, amount }) => {
      console.info({ accountAddress, amount })
      dispatch({ type: ActionTypes.UNWRAP_WETH })
    })
    openSeaSDK.addListener(EventType.ApproveCurrency, ({ accountAddress, tokenAddress }) => {
      console.info({ accountAddress, tokenAddress })
      dispatch({ type: ActionTypes.APPROVE_WETH })
    })
    openSeaSDK.addListener(EventType.ApproveAllAssets, ({ accountAddress, tokenAddress }) => {
      console.info({ accountAddress, tokenAddress })
      dispatch({ type: ActionTypes.APPROVE_ALL_ASSETS })
    })
    openSeaSDK.addListener(EventType.ApproveAsset, ({ accountAddress, tokenAddress, tokenId }) => {
      console.info({ accountAddress, tokenAddress, tokenId })
      dispatch({ type: ActionTypes.APPROVE_ASSET })
    })
    openSeaSDK.addListener(EventType.CreateOrder, ({ order, accountAddress }) => {
      console.info({ order, accountAddress })
      dispatch({ type: ActionTypes.CREATE_ORDER })
    })
    openSeaSDK.addListener(EventType.OrderDenied, ({ order, accountAddress }) => {
      console.info({ order, accountAddress })
      dispatch({ type: ActionTypes.RESET_EXCHANGE })
    })
    openSeaSDK.addListener(EventType.MatchOrders, ({ buy, sell, accountAddress }) => {
      console.info({ buy, sell, accountAddress })
      dispatch({ type: ActionTypes.FULFILL_ORDER })
    })
    openSeaSDK.addListener(EventType.CancelOrder, ({ order, accountAddress }) => {
      console.info({ order, accountAddress })
      dispatch({ type: ActionTypes.CANCEL_ORDER })
    })
  }
}
```

To remove all listeners and start over, just call `openseaSDK.removeAllListeners()`.
