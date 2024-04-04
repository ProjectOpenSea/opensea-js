---
title: Getting Start Guide
category: 64cbb5277b5f3c0065d96616
slug: opensea-sdk-getting-started
parentDocSlug: opensea-sdk
order: 1
hidden: false
---

- [Fetching Assets](#fetching-assets)
  - [Checking Balances and Ownerships](#checking-balances-and-ownerships)
- [Making Offers](#making-offers)
  - [Offer Limits](#offer-limits)
- [Making Listings / Selling Items](#making-listings--selling-items)
  - [Creating English Auctions](#creating-english-auctions)
- [Fetching Orders](#fetching-orders)
- [Buying Items](#buying-items)
- [Accepting Offers](#accepting-offers)

### Fetching NFTs

```TypeScript
const { nft } = await openseaSDK.api.getNFT(tokenAddress, tokenId)
```

Also see methods `getNFTsByCollection`, `getNFTsByContract`, and `getNFTsByAccount`.

#### Checking Balances and Ownerships

```typescript
import { TokenStandard } from "opensea-js";

const asset = {
  // CryptoKitties
  tokenAddress: "0x06012c8cf97bead5deae237070f9587f8e7a266d",
  tokenId: "1",
  tokenStandard: TokenStandard.ERC721,
};

const balance = await openseaSDK.getBalance({
  accountAddress,
  asset,
});

const ownsKitty = balance > 0n;
```

### Making Offers

```typescript
// Token ID and smart contract address for a non-fungible token:
const { tokenId, tokenAddress } = YOUR_ASSET;
// The offerer's wallet address:
const accountAddress = "0x1234...";
// Value of the offer, in units of the payment token (or wrapped ETH if none is specified)
const startAmount = 1.2;

const offer = await openseaSDK.createOffer({
  asset: {
    tokenId,
    tokenAddress,
  },
  accountAddress,
  startAmount,
});
```

When you make an offer on an item owned by an OpenSea user, **that user will automatically get an email notifying them with the offer amount**, if it's above their desired threshold.

#### Offer Limits

Note: The total value of offers must not exceed 1000x wallet balance.

### Making Listings / Selling Items

To sell an asset, call `createListing`:

```typescript
// Expire this auction one day from now.
// Note that we convert from the JavaScript timestamp (milliseconds) to seconds:
const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);

const listing = await openseaSDK.createListing({
  asset: {
    tokenId,
    tokenAddress,
  },
  accountAddress,
  startAmount: 3,
  expirationTime,
});
```

The units for `startAmount` are Ether (ETH). If you want to specify another ERC-20 token to use, see [Using ERC-20 Tokens Instead of Ether](#using-erc-20-tokens-instead-of-ether).

See [Listening to Events](#listening-to-events) to respond to the setup transactions that occur the first time a user sells an item.

### Creating Collection and Trait Offers

Criteria offers, consisting of collection and trait offers, are supported with `openseaSDK.createCollectionOffer()`.

For trait offers, include `traitType` as the trait name and `traitValue` as the required value for the offer.

```typescript
const collection = await sdk.api.getCollection("cool-cats-nft");
const offer = await openseaSDK.createCollectionOffer({
  collectionSlug: collection.collection,
  accountAddress: walletAddress,
  paymentTokenAddress: getWETHAddress(sdk.chain),
  amount: 7,
  quantity: 1,
  traitType: "face",
  traitValue: "tvface bobross",
});
```

#### Creating English Auctions

English Auctions are auctions that start at a small amount (we recommend even doing 0!) and increase with every bid. At expiration time, the item sells to the highest bidder.

To create an English Auction set `englishAuction` to `true`:

```typescript
// Create an auction to receive Wrapped Ether (WETH). See note below.
const paymentTokenAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const englishAuction = true;
// The minimum amount to start the auction at, in normal units (e.g. ETH)
const startAmount = 0;

const auction = await openseaSDK.createListing({
  asset: {
    tokenId,
    tokenAddress,
  },
  accountAddress,
  startAmount,
  expirationTime,
  paymentTokenAddress,
  englishAuction,
});
```

Note that auctions aren't supported with Ether directly due to limitations in Ethereum, so you have to use an ERC20 token, like Wrapped Ether (WETH), a stablecoin like DAI, etc. See [Using ERC-20 Tokens Instead of Ether](#using-erc-20-tokens-instead-of-ether) for more info.

### Fetching Orders

To retrieve a list of offers and auctions on an asset, you can use `getOrders`. Parameters passed into API filter objects are camel-cased and serialized before being sent as [API parameters](https://docs.opensea.io/v2.0/reference):

```typescript
// Get offers (bids), a.k.a. orders where `side == OrderSide.BID`
const { orders, count } = await openseaSDK.api.getOrders({
  assetContractAddress: tokenAddress,
  tokenId,
  side: OrderSide.BID,
});

// Get page 2 of all auctions, a.k.a. orders where `side == OrderSide.ASK`
const { orders, count } = await openseaSDK.api.getOrders({
  assetContractAddress: tokenAddress,
  tokenId,
  side: OrderSide.ASK,
});
```

Note that the listing price of an asset is equal to the `currentPrice` of the **lowest listing** on the asset. Users can lower their listing price without invalidating previous listing, so all get shipped down until they're canceled, or one is fulfilled.

#### Fetching All Offers and Best Listings for a given collection

There are two endpoints that return all offers and listings for a given collection, `getAllOffers` and `getAllListings`.

```typescript
const { offers } = await openseaSDK.api.getAllOffers(collectionSlug);
```

#### Fetching Best Offers and Best Listings for a given NFT

There are two endpoints that return the best offer or listing, `getBestOffer` and `getBestListing`.

```typescript
const offer = await openseaSDK.api.getBestOffer(collectionSlug, tokenId);
```

### Buying Items

To buy an item, you need to **fulfill a listing**. To do that, it's just one call:

```typescript
const order = await openseaSDK.api.getOrder({ side: OrderSide.ASK, ... })
const accountAddress = "0x..." // The buyer's wallet address, also the taker
const transactionHash = await openseaSDK.fulfillOrder({ order, accountAddress })
```

Note that the `fulfillOrder` promise resolves when the transaction has been confirmed and mined to the blockchain. To get the transaction hash before this happens, add an event listener (see [Listening to Events](#listening-to-events)) for the `TransactionCreated` event.

If the order is a listing (sell order, `order.side === OrderSide.ASK`), the taker is the _buyer_ and this will prompt the buyer to pay for the item(s).

### Accepting Offers

Similar to fulfilling listings above, you need to fulfill an offer (buy order) on an item you own to receive the tokens in the offer.

```typescript
const order = await openseaSDK.api.getOrder({ side: OrderSide.BID, ... })
const accountAddress = "0x..." // The owner's wallet address, also the taker
await openseaSDK.fulfillOrder({ order, accountAddress })
```

If the order is an offer (buy order, `order.side === OrderSide.BID`), then the taker is the _owner_ and this will prompt the owner to exchange their item(s) for whatever is being offered in return. See [Listening to Events](#listening-to-events) below to respond to the setup transactions that occur the first time a user accepts a bid.
