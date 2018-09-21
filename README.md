![OpenSea.js Logo](https://storage.googleapis.com/opensea-static/opensea-js-logo.png "OpenSea.js Logo")

## OpenSea.js

[![https://badges.frapsoft.com/os/mit/mit.svg?v=102](https://badges.frapsoft.com/os/mit/mit.svg?v=102)](https://opensource.org/licenses/MIT)
<!-- [![npm](https://img.shields.io/npm/v/wyvern-js.svg)](https://www.npmjs.com/package/wyvern-js) [![npm](https://img.shields.io/npm/dt/wyvern-js.svg)](https://www.npmjs.com/package/wyvern-js) -->

A JavaScript library for crypto-native ecommerce: buying, selling, and bidding on any cryptogood. [GitHub](https://github.com/ProjectOpenSea/opensea-js) | [npm](https://www.npmjs.com/package/opensea-js)

### Synopsis

This is the JavaScript SDK for [OpenSea](https://opensea.io), the largest marketplace for crypto collectibles. It allows developers to access the official orderbook, filter it, create buy orders (**offers**), create sell orders (**auctions**), create collections of assets to sell at once (**bundles**), and complete trades programmatically.

For the first time, you can build a *cryptocommerce dapp*.

You get started by instantiating your own seaport. Then you can create orders off-chain or fulfill orders on-chain, and listen to events (like `ApproveAllAssets` or `WrapEth`) in the process.

Happy seafaring! ⛵️

### Installation

In your project, run:
```bash
npm install --save opensea-js
```

Install [web3](https://github.com/ethereum/web3.js) too if you haven't already.

### Getting Started

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
const offer = await seaport.createBuyOrder({ tokenId, tokenAddress, accountAddress, amountInEth, expirationTime: 0 })
```

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

### Creating Bundles

New in version 0.2.9, you can create bundles of assets to sell at the same time! If the owner has approved all the assets in the bundle already, only a signature is needed to create it.

To make a bundle, it's just one line of code:

```JavaScript
const assets: Array<{tokenId: string; tokenAddress: string}> = [...]

const bundle = await seaport.createBundleSellOrder({
  bundleName, bundleDescription, bundleExternalLink, assets, accountAddress, startAmountInEth, endAmountInEth, expirationTime
})
```

The parameters `bundleDescription`, `bundleExternalLink`, and `expirationTime` are optional, and `endAmountInEth` can equal `startAmountInEth`, similar to the normal `createSellOrder` functionality.

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
      dispatch({ type: ActionTypes.RESET_EXCHANGE })
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

### Example Code

Check out the [Ship's Log](https://github.com/ProjectOpenSea/ships-log), built with the SDK, which shows the recent orders in the OpenSea orderbook.

You can also view a live demo [here](https://ships-log.herokuapp.com/)!

### Learning More

Detailed documentation is coming soon on [docs.opensea.io](https://docs.opensea.io).

In the meantime, visit the auto-generated documentation [here](https://projectopensea.github.io/opensea-js/), or contact the OpenSea devs for help! They're available every day on [Discord](https://discord.gg/XjwWYgU) in the `#developers` channel.

### Development Information

#### Setup

[Node >= v8.11.2](https://nodejs.org/en/) required.

Before any development, install the required NPM dependencies:

```bash
npm install
```

#### Build

Then, lint and build the library into the `lib` directory:

```bash
npm run build
```

Or run the tests:
```bash
npm test
```

Note that the tests require access to both Infura and the OpenSea API. The timeout is adjustable via the `test` script in `package.json`.

#### Generate Documentation

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

#### Contributing

Contributions welcome! Please use GitHub issues for suggestions/concerns - if you prefer to express your intentions in code, feel free to submit a pull request.
