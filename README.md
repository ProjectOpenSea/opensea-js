<p align="center">
  <img src="./img/banner.png" />
</p>

[![Version][version-badge]][version-link]
[![npm][npm-badge]][npm-link]
[![Test CI][ci-badge]][ci-link]
[![Coverage Status][coverage-badge]][coverage-link]
[![License][license-badge]][license-link]
[![Docs][docs-badge]][docs-link]
[![Discussions][discussions-badge]][discussions-link]

# OpenSea.js <!-- omit in toc -->

A JavaScript library for crypto-native e-commerce: buying, selling, and bidding on NFTs (non-fungible tokens). With OpenSea.js, you can easily build your own native marketplace. These can be ERC-721 or ERC-1155 (semi-fungible) items. You don't have to deploy your own smart contracts or manage backend orderbooks.

- [Synopsis](#synopsis)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Fetching Assets](#fetching-assets)
    - [Checking Balances and Ownerships](#checking-balances-and-ownerships)
  - [Making Offers](#making-offers)
    - [Bidding on ENS Short Name Auctions](#bidding-on-ens-short-name-auctions)
    - [Offer Limits](#offer-limits)
  - [Making Listings / Selling Items](#making-listings--selling-items)
  - [Fetching Orders](#fetching-orders)
  - [Buying Items](#buying-items)
  - [Accepting Offers](#accepting-offers)
  - [Transferring Items or Coins (Gifting)](#transferring-items-or-coins-gifting)
- [Advanced](#advanced)
  - [Scheduling Future Listings](#scheduling-future-listings)
  - [Purchasing Items for Other Users](#purchasing-items-for-other-users)
  - [Using ERC-20 Tokens Instead of Ether](#using-erc-20-tokens-instead-of-ether)
  - [Private Auctions](#private-auctions)
  - [Listening to Events](#listening-to-events)
- [Learning More](#learning-more)
- [Changelog](#changelog)
- [Development Information](#development-information)
- [Diagnosing Common Issues](#diagnosing-common-issues)
- [Testing your branch locally](#testing-your-branch-locally)

## Synopsis

This is the JavaScript SDK for [OpenSea](https://opensea.io), the largest marketplace for NFTs.

It allows developers to access the official orderbook, filter it, create buy orders (**offers**), create sell orders (**auctions**), and complete trades programmatically.

Get started by [requesting an API key](https://docs.opensea.io/reference/api-keys) and instantiating your own OpenSea SDK instance. Then you can create orders off-chain or fulfill orders on-chain, and listen to events (like `ApproveAllAssets` or `WrapEth`) in the process.

Happy seafaring! ⛵️

## Installation

Switching to Node.js version 16 is required for SDK Version 3.0+ and to make sure common crypto dependencies work. Execute `nvm use`, if you have Node Version Manager.

Then, in your project, run:

```bash
npm install --save opensea-js
# or
yarn add opensea-js
```

## Getting Started

To get started, first [request an API key](https://docs.opensea.io/reference/api-keys). Note the terms of use for using API data.

Then, create a new OpenSeaJS client, called an OpenSeaSDK 🚢, using your web3 provider:

```typescript
import { ethers } from "ethers";
import { OpenSeaSDK, Chain } from "opensea-js";

// This example provider won't let you make transactions, only read-only calls:
const provider = new ethers.providers.JsonRpcProvider(
  "https://mainnet.infura.io",
);

const openseaSDK = new OpenSeaSDK(provider, {
  chain: Chain.Mainnet,
  apiKey: YOUR_API_KEY,
});
```

**NOTE:** For testnet, please use `Chain.Goerli` as the `chain`. Rinkeby was deprecated in 2022.

**NOTE:** Using the sample provider above won't let you authorize transactions, which are needed when approving and trading assets and currency. To make transactions, you need a provider with a private key or mnemonic set.

In a browser with web3 or an extension like [MetaMask](https://metamask.io/) or [Coinbase Wallet](https://www.coinbase.com/wallet), you can use `window.ethereum` to access the native provider.

### Fetching Assets

Assets are items on OpenSea. They can be non-fungible (conforming to standards like ERC721), semi-fungible (like ERC1155 assets), and even fungible (ERC20).

Assets are represented by the `Asset` type, defined in TypeScript:

```TypeScript
/**
 * Simple, unannotated non-fungible asset spec
 */
export interface Asset {
  // The asset's token ID, or null if ERC-20
  tokenId: string | null,
  // The asset's contract address
  tokenAddress: string,
  // The schema name (defaults to "ERC721") for this asset
  tokenStandard?: TokenStandard,
  // Optional for ENS names
  name?: string,
  // Optional for fungible items
  decimals?: number
}
```

The `Asset` type is the minimal type you need for most marketplace actions. `TokenStandard` is optional. If omitted, most actions will assume you're referring to a non-fungible, ERC721 asset. Other options include 'ERC20' and 'ERC1155'. You can import `import { TokenStandard } from "opensea-js/lib/types"` to get the full range of schemas supported.

You can fetch an asset using the `OpenSeaAPI`, which will return an `OpenSeaAsset` for you (`OpenSeaAsset` extends `Asset`):

```TypeScript
const asset: OpenSeaAsset = await openseaSDK.api.getAsset({
  tokenAddress, // string
  tokenId, // string | number | BigNumber | null
})
```

Note that fungible ERC20 assets have `null` as their token id.

#### Checking Balances and Ownerships

The nice thing about the `Asset` type is that it unifies logic between fungibles, non-fungibles, and semi-fungibles.

Once you have an `Asset`, you can see how many any account owns, regardless of whether it's an ERC-20 token or a non-fungible good:

```typescript
const asset = {
  tokenAddress: "0x06012c8cf97bead5deae237070f9587f8e7a266d", // CryptoKitties
  tokenId: "1", // Token ID
};

const balance = await openseaSDK.getBalance({
  accountAddress, // string
  asset, // Asset
});

const ownsKitty = balance.greaterThan(0);
```

### Making Offers

Once you have your asset, you can do this to make an offer on it:

```typescript
// Token ID and smart contract address for a non-fungible token:
const { tokenId, tokenAddress } = YOUR_ASSET;
// The offerer's wallet address:
const accountAddress = "0x1234...";

const offer = await openseaSDK.createBuyOrder({
  asset: {
    tokenId,
    tokenAddress,
    tokenStandard, // TokenStandard. If omitted, defaults to 'ERC721'. Other options include 'ERC20' and 'ERC1155'
  },
  accountAddress,
  // Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
  startAmount: 1.2,
});
```

When you make an offer on an item owned by an OpenSea user, **that user will automatically get an email notifying them with the offer amount**, if it's above their desired threshold.

#### Bidding on ENS Short Name Auctions

The Ethereum Name Service (ENS) is auctioning short (3-6 character) names that can be used for labeling wallet addresses and more. Learn more on the [ENS FAQ](https://opensea.io/ens).

To bid, you must use the ENS Short Name schema:

```typescript
const {
  tokenId,
  // Token address should be `0xfac7bea255a6990f749363002136af6556b31e04` on mainnet
  tokenAddress,
  // Name must have `.eth` at the end and correspond with the tokenId
  name
} = ENS_ASSET // You can get an ENS asset from `openseaSDK.api.getAsset(...)`

const offer = await openseaSDK.createBuyOrder({
  asset: {
    tokenId,
    tokenAddress,
    name,
    // Only needed for the short-name auction, not ENS names
    // that have been sold once already:
    tokenStandard: "ENSShortNameAuction"
  },
  // Your wallet address (the bidder's address):
  accountAddress: "0x1234..."
  // Value of the offer, in wrapped ETH:
  startAmount: 1.2,
})
```

#### Offer Limits

Note: The total value of buy orders must not exceed 1000 x wallet balance.

### Making Listings / Selling Items

To sell an asset, call `createSellOrder`. You can do a fixed-price listing, where `startAmount` is equal to `endAmount`, or a declining [Dutch auction](https://en.wikipedia.org/wiki/Dutch_auction), where `endAmount` is lower and the price declines until `expirationTime` is hit:

```typescript
// Expire this auction one day from now.
// Note that we convert from the JavaScript timestamp (milliseconds):
const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);

const listing = await openseaSDK.createSellOrder({
  asset: {
    tokenId,
    tokenAddress,
  },
  accountAddress,
  startAmount: 3,
  // If `endAmount` is specified, the order will decline in value to that amount until `expirationTime`. Otherwise, it's a fixed-price order:
  endAmount: 0.1,
  expirationTime,
});
```

The units for `startAmount` and `endAmount` are Ether, ETH. If you want to specify another ERC-20 token to use, see [Using ERC-20 Tokens Instead of Ether](#using-erc-20-tokens-instead-of-ether).

See [Listening to Events](#listening-to-events) to respond to the setup transactions that occur the first time a user sells an item.

#### Creating English Auctions

English Auctions are auctions that start at a small amount (we recommend even doing 0!) and increase with every bid. At expiration time, the item sells to the highest bidder.

To create an English Auction, create a listing that waits for the highest bid by setting `waitForHighestBid` to `true`:

```typescript
// Create an auction to receive Wrapped Ether (WETH). See note below.
const paymentTokenAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const startAmount = 0; // The minimum amount to sell for, in normal units (e.g. ETH)

const auction = await openseaSDK.createSellOrder({
  asset: {
    tokenId,
    tokenAddress,
  },
  accountAddress,
  startAmount,
  expirationTime,
  paymentTokenAddress,
  waitForHighestBid: true,
});
```

Note that auctions aren't supported with Ether directly due to limitations in Ethereum, so you have to use an ERC20 token, like Wrapped Ether (WETH), a stablecoin like DAI, etc. See [Using ERC-20 Tokens Instead of Ether](#using-erc-20-tokens-instead-of-ether) for more info.

### Fetching Orders

To retrieve a list of offers and auctions on an asset, you can use an instance of the `OpenSeaAPI` exposed on the client. Parameters passed into API filter objects are camel-cased and serialized before being sent as [OpenSea API parameters](https://docs.opensea.io/v2.0/reference):

```typescript
// Get offers (bids), a.k.a. orders where `side == 0`
const { orders, count } = await openseaSDK.api.getOrders({
  assetContractAddress: tokenAddress,
  tokenId,
  side: "bid",
});

// Get page 2 of all auctions, a.k.a. orders where `side == 1`
const { orders, count } = await openseaSDK.api.getOrders(
  {
    assetContractAddress: tokenAddress,
    tokenId,
    side: "ask",
  },
  2,
);
```

Note that the listing price of an asset is equal to the `currentPrice` of the **lowest valid sell order** on the asset. Users can lower their listing price without invalidating previous sell orders, so all get shipped down until they're canceled, or one is fulfilled.

To learn more about signatures, makers, takers, listingTime vs createdTime and other kinds of order terminology, please read the [**Terminology Section**](https://docs.opensea.io/reference#terminology) of the API Docs.

The available API filters for the orders endpoint is documented in the `OrdersQueryOptions` interface below, but see the main [API Docs](https://docs.opensea.io/reference#reference-getting-started) for a playground, along with more up-to-date and detailed explanations.

```TypeScript
/**
   * Attrs used by orderbook to make queries easier
   * More to come soon!
   */
  side: "bid" | "ask", // "bid" for buy orders, "ask" for sell orders
  protocol?: "seaport"; // Protocol of the order (more options may be added in future)
  maker?: string, // Address of the order's creator
  taker?: string, // The null address if anyone is allowed to take the order
  owner?: string, // Address of owner of the order's item
  sale_kind?: SaleKind, // 0 for fixed-price, 1 for Dutch auctions
  assetContractAddress?: string, // Contract address for order's item
  paymentTokenAddress?: string; // Contract address for order's payment token
  tokenId?: number | string,
  tokenIds?: Array<number | string>,
  listedAfter?: number | string, // This means listing_time > value in seconds
  listedBefore?: number | string, // This means listing_time <= value in seconds
  orderBy?: "created_date" | "eth_price", // Field to sort results by
  orderDirection?: "asc" | "desc", // Sort direction of orderBy sorting of results
  onlyEnglish?: boolean, // Only return english auction orders

  // For pagination
  limit?: number,
  offset?: number,
```

### Buying Items

To buy an item, you need to **fulfill a sell order**. To do that, it's just one call:

```typescript
const order = await openseaSDK.api.getOrder({ side: "ask", ... })
const accountAddress = "0x..." // The buyer's wallet address, also the taker
const transactionHash = await openseaSDK.fulfillOrder({ order, accountAddress })
```

Note that the `fulfillOrder` promise resolves when the transaction has been confirmed and mined to the blockchain. To get the transaction hash before this happens, add an event listener (see [Listening to Events](#listening-to-events)) for the `TransactionCreated` event.

If the order is a sell order (`order.side === "ask"`), the taker is the _buyer_ and this will prompt the buyer to pay for the item(s).

### Accepting Offers

Similar to fulfilling sell orders above, you need to fulfill a buy order on an item you own to receive the tokens in the offer.

```typescript
const order = await openseaSDK.api.getOrder({ side: "bid", ... })
const accountAddress = "0x..." // The owner's wallet address, also the taker
await openseaSDK.fulfillOrder({ order, accountAddress })
```

If the order is a buy order (`order.side === "bid"`), then the taker is the _owner_ and this will prompt the owner to exchange their item(s) for whatever is being offered in return. See [Listening to Events](#listening-to-events) below to respond to the setup transactions that occur the first time a user accepts a bid.

### Transferring Items or Coins (Gifting)

A handy feature in OpenSea.js is the ability to transfer any supported asset (fungible or non-fungible tokens) in one line of JavaScript.

To transfer an ERC-721 asset or an ERC-1155 asset, it's just one call:

```typescript
const transactionHash = await openseaSDK.transfer({
  asset: { tokenId, tokenAddress },
  fromAddress, // Must own the asset
  toAddress,
});
```

For fungible ERC-1155 assets, you can set `tokenStandard` to "ERC1155" and pass a `quantity` in to transfer multiple at once:

```typescript
const transactionHash = await openseaSDK.transfer({
  asset: {
    tokenId,
    tokenAddress,
    tokenStandard: "ERC1155",
  },
  fromAddress, // Must own the asset
  toAddress,
  quantity: 2,
});
```

To transfer fungible assets without token IDs, like ERC20 tokens, you can pass in an `OpenSeaFungibleToken` as the `asset`, set `tokenStandard` to "ERC20", and include `quantity` in base units (e.g. wei) to indicate how many.

Example for transferring 2 DAI ($2) to another address:

```typescript
const paymentToken = (await openseaSDK.api.getPaymentTokens({ symbol: "DAI" }))
  .tokens[0];
const quantity = ethers.utils.parseUnits("2", paymentToken.decimals);
const transactionHash = await openseaSDK.transfer({
  asset: {
    tokenId: null,
    tokenAddress: paymentToken.address,
    tokenStandard: "ERC20",
  },
  fromAddress, // Must own the tokens
  toAddress,
  quantity,
});
```

For more information, check out the [documentation](https://projectopensea.github.io/opensea-js/).

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

## Learning More

Auto-generated documentation for each export is available [here](https://projectopensea.github.io/opensea-js/).

## Changelog

See the [Changelog](CHANGELOG.md).

## Development Information

**Setup**

Before any development, install the required NPM dependencies:

```bash
npm install
```

And install TypeScript if you haven't already:

```bash
npm install -g typescript
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

Note that the tests require access to Alchemy and the OpenSea API. The timeout is adjustable via the `test` script in `package.json`.

**Generate Documentation**

Generate html docs, also available for browsing [here](https://projectopensea.github.io/opensea-js/):

```bash
npm run docs-build
```

**Contributing**

Contributions welcome! Please use GitHub issues for suggestions/concerns - if you prefer to express your intentions in code, feel free to submit a pull request.

## Diagnosing Common Issues

- Is the `expirationTime` in the future? If not, change it to a time in the future.

- Are the input addresses all strings? If not, convert them to strings.

- Is your computer's internal clock accurate? If not, try enabling automatic clock adjustment locally or following [this tutorial](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/set-time.html) to update an Amazon EC2 instance.

## Testing your branch locally

```sh
npm link # in opensea-js repo
npm link opensea-js # in repo you're working on
```

[version-badge]: https://img.shields.io/github/package-json/v/ProjectOpenSea/opensea-js
[version-link]: https://github.com/ProjectOpenSea/opensea-js/releases
[npm-badge]: https://img.shields.io/npm/v/opensea-js?color=red
[npm-link]: https://www.npmjs.com/package/opensea-js
[ci-badge]: https://github.com/ProjectOpenSea/opensea-js/actions/workflows/code-quality.yml/badge.svg
[ci-link]: https://github.com/ProjectOpenSea/opensea-js/actions/workflows/code-quality.yml
[coverage-badge]: https://coveralls.io/repos/github/ProjectOpenSea/opensea-js/badge.svg?branch=main
[coverage-link]: https://coveralls.io/github/ProjectOpenSea/opensea-js?branch=main
[license-badge]: https://img.shields.io/github/license/ProjectOpenSea/opensea-js
[license-link]: https://github.com/ProjectOpenSea/opensea-js/blob/main/LICENSE
[docs-badge]: https://img.shields.io/badge/OpenSea.js-documentation-informational
[docs-link]: https://github.com/ProjectOpenSea/opensea-js#getting-started
[discussions-badge]: https://img.shields.io/badge/OpenSea.js-discussions-blueviolet
[discussions-link]: https://github.com/ProjectOpenSea/opensea-js/discussions
