![OpenSea.js Logo](https://storage.googleapis.com/opensea-static/opensea-js-logo.png "OpenSea.js Logo")

# OpenSea.js <!-- omit in toc -->

[![https://badges.frapsoft.com/os/mit/mit.svg?v=102](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://opensource.org/licenses/MIT)
<!-- [![npm](https://img.shields.io/npm/v/wyvern-js.svg)](https://www.npmjs.com/package/wyvern-js) [![npm](https://img.shields.io/npm/dt/wyvern-js.svg)](https://www.npmjs.com/package/wyvern-js) -->

A JavaScript library for crypto-native ecommerce: buying, selling, and bidding on any cryptogood. With OpenSea JS, you can easily build your own native marketplace for your ERC721 items without having to deploy your own smart contracts or backend orderbooks. [GitHub](https://github.com/ProjectOpenSea/opensea-js) | [npm](https://www.npmjs.com/package/opensea-js)

- [Synopsis](#synopsis)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Fetching Orders](#fetching-orders)
  - [Buying Items](#buying-items)
  - [Accepting Offers](#accepting-offers)
- [Advanced](#advanced)
  - [Creating Bundles](#creating-bundles)
  - [Using ERC-20 Tokens Instead of Ether](#using-erc-20-tokens-instead-of-ether)
  - [Sharing Sale Fees with OpenSea](#sharing-sale-fees-with-opensea)
  - [Listening to Events](#listening-to-events)
- [Learning More](#learning-more)
  - [Example Code](#example-code)
- [Development Information](#development-information)

## Synopsis

This is the JavaScript SDK for [OpenSea](https://opensea.io), the largest marketplace for crypto collectibles. It allows developers to access the official orderbook, filter it, create buy orders (**offers**), create sell orders (**auctions**), create collections of assets to sell at once (**bundles**), and complete trades programmatically.

For the first time, you can build a *cryptocommerce dapp*.

You get started by instantiating your own seaport. Then you can create orders off-chain or fulfill orders on-chain, and listen to events (like `ApproveAllAssets` or `WrapEth`) in the process.

Happy seafaring! ⛵️

## Installation

In your project, run:
```bash
npm install --save opensea-js
```

Install [web3](https://github.com/ethereum/web3.js) too if you haven't already.

## Getting Started

To get started, create a new OpenSeaJS client, called an OpenSeaPort 🚢, using your Web3 provider:

```JavaScript
import * as Web3 from 'web3'
import { OpenSeaPort, Network } from 'opensea-js'

const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')

const seaport = new OpenSeaPort(provider, {
  networkName: Network.Main
})
```

Then, you can do this to make an offer on an asset:

```JavaScript
// An expirationTime of 0 means it will never expire
const offer = await seaport.createBuyOrder({ tokenId, tokenAddress, accountAddress, startAmount, expirationTime: 0 })
```

... or this to sell an asset:

```JavaScript
// Expire this auction one day from now
const expirationTime = (Date.now() / 1000 + 60 * 60 * 24)
// If `endAmount` is specified, the order will decline in value to that amount until `expirationTime`. Otherwise, it's a fixed-price order.
const auction = await seaport.createSellOrder({ tokenId, tokenAddress, accountAddress, startAmount, endAmount, expirationTime })
```

The units for `startAmount` and `endAmount` are Ether, ETH. If you want to specify another ERC-20 token to use, see [Using ERC-20 Tokens Instead of Ether](#using-erc-20-tokens-instead-of-ether).

See [Listening to Events](#listening-to-events) to respond to the setup transactions that occur the first time a user sells an item.

### Fetching Orders

To retrieve a list of offers and auction on an asset, you can use an instance of the `OpenSeaAPI` exposed on the client. Parameters passed into API filter objects are underscored instead of camel-cased, similar to the main [OpenSea API parameters](https://docs.opensea.io/v1.0/reference):

```JavaScript
import { OrderSide } from 'opensea-js/lib/types'

// Get offers (bids), a.k.a. orders where `side == 0`
const { orders, count } = await seaport.api.getOrders({
  asset_contract_address: tokenAddress,
  token_id: token_id,
  side: OrderSide.Buy
})

// Get page 2 of all auctions, a.k.a. orders where `side == 1`
const { orders, count } = await seaport.api.getOrders({
  asset_contract_address: tokenAddress,
  token_id: token_id,
  side: OrderSide.Sell
}, 2)
```

Note that the listing price of an asset is equal to the `currentPrice` of the **lowest valid sell order** on the asset. Users can lower their listing price without invalidating previous sell orders, so all get shipped down until they're cancelled or one is fulfilled.

The available API filters for the orders endpoint is documented in the `OrderJSON` interface:

```TypeScript
/**
   * Attrs used by orderbook to make queries easier
   * More to come soon!
   */
  maker?: string, // Address of the order's creator
  taker?: string, // The null address if anyone is allowed to take the order
  side?: OrderSide, // 0 for offers, 1 for auctions
  owner?: string, // Address of owner of the order's asset
  sale_kind?: SaleKind, // 0 for fixed-price, 1 for Dutch auctions
  asset_contract_address?: string, // Contract address for order's asset
  token_id?: number | string,
  token_ids?: Array<number | string>,
  listed_after?: number | string, // This means listing_time > value in seconds
  listed_before?: number | string, // This means listing_time <= value in seconds

  // For pagination
  limit?: number,
  offset?: number,
```

### Buying Items

To buy an item , you need to **fulfill a sell order**. To do that, it's just one call:

```JavaScript
const order = await seaport.api.getOrder({ side: OrderSide.Sell, ... })
const accountAddress = "0x..." // The buyer's wallet address, also the taker
await this.props.seaport.fulfillOrder({ order, accountAddress })
```

If the order is a sell order (`order.side === OrderSide.Sell`), the taker is the *buyer* and this will prompt the buyer to pay for the item(s).

### Accepting Offers

Similar to fulfilling sell orders above, you need to fulfill a buy order on an item you own to receive the tokens in the offer.

```JavaScript
const order = await seaport.api.getOrder({ side: OrderSide.Buy, ... })
const accountAddress = "0x..." // The owner's wallet address, also the taker
await this.props.seaport.fulfillOrder({ order, accountAddress })
```

If the order is a buy order (`order.side === OrderSide.Buy`), then the taker is the *owner* and this will prompt the owner to exchange their item(s) for whatever is being offered in return. See [Listening to Events](#listening-to-events) below to respond to the setup transactions that occur the first time a user accepts a bid. 

## Advanced

Interested in bundling items together or making bids in different ERC-20 tokens? OpenSea.js can help with that.

### Creating Bundles

New in version 0.2.9, you can create bundles of assets to sell at the same time! If the owner has approved all the assets in the bundle already, only a signature is needed to create it.

To make a bundle, it's just one call:

```JavaScript
const assets: Array<{tokenId: string; tokenAddress: string}> = [...]

const bundle = await seaport.createBundleSellOrder({
  bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmount, endAmount, expirationTime
})
```

The parameters `bundleDescription`, `bundleExternalLink`, and `expirationTime` are optional, and `endAmount` can equal `startAmount`, similar to the normal `createSellOrder` functionality.

### Using ERC-20 Tokens Instead of Ether

**New in version 0.3:** now you can make auctions and offers in whatever ERC-20 token you want! Just specify the token's contract address as the `paymentTokenAddress` when creating the order.

Here's an example of listing the Genesis CryptoKitty for $100! No more needing to worry about the exchange rate:

```JavaScript
// Token address for the DAI stablecoin, which is pegged to $1 USD
const paymentTokenAddress = "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359"

// The units for `startAmount` and `endAmount` are now in DAI, so $100 USD
const auction = await seaport.createSellOrder({
  tokenAddress: "0x06012c8cf97bead5deae237070f9587f8e7a266d", // CryptoKitties
  tokenId: "1", // Token ID
  accountAddress: OWNERS_WALLET_ADDRESS,
  startAmount: 100,
  expirationTime: 0,
  paymentTokenAddress
})
```

Fun note: all ERC-20 tokens are allowed! This means you can create crazy offers on crypto collectibles **using your own ERC-20 token**. However, opensea.io will only display offers and auctions in ERC-20 tokens that it knows about, optimizing the user experience of order takers. Orders made with the following tokens will be shown on OpenSea for the near future:

* MANA, Decentraland's currency: https://etherscan.io/token/0x0f5d2fb29fb7d3cfee444a200298f468908cc942 
* DAI, Maker's stablecoin, pegged to $1 USD: https://etherscan.io/token/0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359

### Sharing Sale Fees with OpenSea

We share fees for successful sales with game developers, relayers, and affiliates using the OpenSea orderbook. Developers can customize the fee amount to apply to  buyers and/or sellers.

More information will appear here when our redesigned affiliate program is ready. In the meantime, contact us at contact@opensea.io (or in [Discord](https://discord.gg/ga8EJbv)), or use our legacy affiliate program at https://opensea.io/account#referrals.

### Listening to Events

Events are fired whenever transactions or orders are being created, and when transactions return receipts from recently mined blocks on the Ethereum blockchain.

Our recommendation is that you "forward" OpenSea events to your own store or state management system. Here's an example of doing that with a Redux action:

```JavaScript
import { EventType } from 'opensea-js'
import * as ActionTypes from './index'
import { openSeaPort } from '../globalSingletons'

// ...

handleSeaportEvents() {
  return async function(dispatch, getState) {
    openSeaPort.addListener(EventType.TransactionCreated, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      dispatch({ type: ActionTypes.SET_PENDING_TRANSACTION_HASH, hash: transactionHash })
    })
    openSeaPort.addListener(EventType.TransactionConfirmed, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      // Only reset your exchange UI if we're finishing an order fulfillment or cancellation
      if (event == EventType.MatchOrders || event == EventType.CancelOrder) {
        dispatch({ type: ActionTypes.RESET_EXCHANGE })
      }
    })
    openSeaPort.addListener(EventType.TransactionFailed, ({ transactionHash, event }) => {
      console.info({ transactionHash, event })
      dispatch({ type: ActionTypes.RESET_EXCHANGE })
    })
    openSeaPort.addListener(EventType.InitializeAccount, ({ accountAddress }) => {
      console.info({ accountAddress })
      dispatch({ type: ActionTypes.INITIALIZE_PROXY })
    })
    openSeaPort.addListener(EventType.WrapEth, ({ accountAddress, amount }) => {
      console.info({ accountAddress, amount })
      dispatch({ type: ActionTypes.WRAP_ETH })
    })
    openSeaPort.addListener(EventType.UnwrapWeth, ({ accountAddress, amount }) => {
      console.info({ accountAddress, amount })
      dispatch({ type: ActionTypes.UNWRAP_WETH })
    })
    openSeaPort.addListener(EventType.ApproveCurrency, ({ accountAddress, tokenAddress }) => {
      console.info({ accountAddress, tokenAddress })
      dispatch({ type: ActionTypes.APPROVE_WETH })
    })
    openSeaPort.addListener(EventType.ApproveAllAssets, ({ accountAddress, proxyAddress, tokenAddress }) => {
      console.info({ accountAddress, proxyAddress, tokenAddress })
      dispatch({ type: ActionTypes.APPROVE_ALL_ASSETS })
    })
    openSeaPort.addListener(EventType.ApproveAsset, ({ accountAddress, proxyAddress, tokenAddress, tokenId }) => {
      console.info({ accountAddress, proxyAddress, tokenAddress, tokenId })
      dispatch({ type: ActionTypes.APPROVE_ASSET })
    })
    openSeaPort.addListener(EventType.CreateOrder, ({ order, accountAddress }) => {
      console.info({ order, accountAddress })
      dispatch({ type: ActionTypes.CREATE_ORDER })
    })
    openSeaPort.addListener(EventType.MatchOrders, ({ buy, sell, accountAddress }) => {
      console.info({ buy, sell, accountAddress })
      dispatch({ type: ActionTypes.FULFILL_ORDER })
    })
    openSeaPort.addListener(EventType.CancelOrder, ({ order, accountAddress }) => {
      console.info({ order, accountAddress })
      dispatch({ type: ActionTypes.CANCEL_ORDER })
    })
  }
}
```

To remove all listeners and start over, just call `seaport.removeAllListeners()`.

## Learning More

Detailed documentation is coming soon on [docs.opensea.io](https://docs.opensea.io).

In the meantime, visit the auto-generated documentation [here](https://projectopensea.github.io/opensea-js/), or contact the OpenSea devs for help! They're available every day on [Discord](https://discord.gg/XjwWYgU) in the `#developers` channel.

### Example Code

Check out the [Ship's Log](https://github.com/ProjectOpenSea/ships-log), built with the SDK, which shows the recent orders in the OpenSea orderbook.

You can view a live demo [here](https://ships-log.herokuapp.com/)! Also check out the [Mythereum marketplace](https://mythereum.io/marketplace), which is entirely powered by OpenSea.js.

## Development Information

**Setup**

[Node >= v8.11.2](https://nodejs.org/en/) required.

Before any development, install the required NPM dependencies:

```bash
npm install
```

**Build**

Then, lint and build the library into the `lib` directory:

```bash
npm run build
```

Or run the tests:
```bash
npm test
```

Note that the tests require access to both Infura and the OpenSea API. The timeout is adjustable via the `test` script in `package.json`.

**Generate Documentation**

Generate html docs, also available for browsing [here](https://projectopensea.github.io/opensea-js/):
```bash
npm run docsHtml
```

Or generate markdown docs available for browsing on git repos:
```bash
npm run docsMarkdown
```

Due to a markdown theme typescript issue, `docs` just generates html docs right now:
```bash
npm run docs
```

**Contributing**

Contributions welcome! Please use GitHub issues for suggestions/concerns - if you prefer to express your intentions in code, feel free to submit a pull request.
