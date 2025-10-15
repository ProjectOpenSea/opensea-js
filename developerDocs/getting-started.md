---
title: Getting Started Guide
category: 64cbb5277b5f3c0065d96616
slug: opensea-sdk-getting-started
parentDocSlug: opensea-sdk
order: 1
hidden: false
---

> 📖 **For a complete reference of all SDK methods with detailed parameters and return types, see the [API Reference](api-reference.md).**

- [Fetching NFTs](#fetching-nfts)
  - [Checking Balances and Ownerships](#checking-balances-and-ownerships)
- [Making Offers](#making-offers)
  - [Offer Limits](#offer-limits)
- [Making Listings / Selling Items](#making-listings--selling-items)
  - [Creating Collection and Trait Offers](#creating-collection-and-trait-offers)
- [Fetching Orders](#fetching-orders)
  - [Fetching an Order by Hash](#fetching-an-order-by-hash)
  - [Fetching All Offers and Listings for a Collection](#fetching-all-offers-and-listings-for-a-collection)
  - [Fetching Best Offers and Best Listings for an NFT](#fetching-best-offers-and-best-listings-for-an-nft)
- [Fetching Events](#fetching-events)
  - [Get All Events](#get-all-events)
  - [Get Events by Account](#get-events-by-account)
  - [Get Events by Collection](#get-events-by-collection)
  - [Get Events by NFT](#get-events-by-nft)
- [Buying Items](#buying-items)
- [Accepting Offers](#accepting-offers)

## Fetching NFTs

Fetch a single NFT by contract address and token ID:

```typescript
const { nft } = await openseaSDK.api.getNFT(tokenAddress, tokenId);
```

**Additional NFT Methods:**

- `getNFTsByCollection(collectionSlug, limit?, next?)` - Get all NFTs in a collection
- `getNFTsByContract(contractAddress, limit?, next?, chain?)` - Get all NFTs for a contract
- `getNFTsByAccount(accountAddress, limit?, next?, chain?)` - Get all NFTs owned by an account
- `getContract(contractAddress, chain?)` - Get contract information

### Checking Balances and Ownerships

```typescript
import { TokenStandard } from "opensea-js";

const asset = {
  // CryptoKitties contract
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

## Making Offers

```typescript
// Token ID and smart contract address for a non-fungible token:
const { tokenId, tokenAddress } = YOUR_ASSET;
// The offerer's wallet address:
const accountAddress = "0x1234...";
// Value of the offer, in units of the payment token (or WETH if none is specified)
const amount = 1.2;

const offer = await openseaSDK.createOffer({
  asset: {
    tokenId,
    tokenAddress,
  },
  accountAddress,
  amount,
});
```

When you make an offer on an item owned by an OpenSea user, **that user will automatically get an email notifying them with the offer amount**, if it's above their desired threshold.

**Creating Multiple Offers:** To create multiple offers efficiently with a single signature, see [Bulk Order Creation](advanced-use-cases.md#bulk-order-creation) in the Advanced Use Cases guide.

### Offer Limits

Note: The total value of offers must not exceed 1000x wallet balance.

## Making Listings / Selling Items

To sell an asset, call `createListing`:

```typescript
import { getUnixTimestampInSeconds, TimeInSeconds } from "opensea-js";

// Expire this listing one day from now
const expirationTime = getUnixTimestampInSeconds(TimeInSeconds.DAY);

const listing = await openseaSDK.createListing({
  asset: {
    tokenId,
    tokenAddress,
  },
  accountAddress,
  amount: 3,
  expirationTime,
});
```

The units for `amount` are in ETH.

> **Note on Payment Tokens**: OpenSea currently supports one payment token for listings (typically the native token like ETH) and one for offers (typically the wrapped native token like WETH). Polygon is an exception where WETH is used for both listings and offers instead of POL/WPOL. To get the correct payment token for your chain, use `getListingPaymentToken(chain)` for listings and `getOfferPaymentToken(chain)` for offers.

```typescript
import { getListingPaymentToken } from "opensea-js";

const listing = await openseaSDK.createListing({
  asset: { tokenId, tokenAddress },
  accountAddress,
  amount: 3,
  paymentTokenAddress: getListingPaymentToken(openseaSDK.chain), // Optional: defaults to chain's listing token
  expirationTime,
});
```

**Creating Multiple Listings:** To create multiple listings efficiently with a single signature, see [Bulk Order Creation](advanced-use-cases.md#bulk-order-creation) in the Advanced Use Cases guide.

### Creating Collection and Trait Offers

Collection offers and trait offers are supported with `openseaSDK.createCollectionOffer()`.

For **collection offers**, provide the collection slug:

```typescript
import { getOfferPaymentToken } from "opensea-js";

const collection = await openseaSDK.api.getCollection("cool-cats-nft");
const offer = await openseaSDK.createCollectionOffer({
  collectionSlug: collection.collection,
  accountAddress: walletAddress,
  paymentTokenAddress: getOfferPaymentToken(openseaSDK.chain),
  amount: 7,
  quantity: 1,
});
```

For **trait offers**, include `traitType` as the trait name and `traitValue` as the required value:

```typescript
const offer = await openseaSDK.createCollectionOffer({
  collectionSlug: "cool-cats-nft",
  accountAddress: walletAddress,
  paymentTokenAddress: getOfferPaymentToken(openseaSDK.chain),
  amount: 7,
  quantity: 1,
  traitType: "face",
  traitValue: "tvface bobross",
});
```

## Fetching Orders

To retrieve a list of offers and listings on an asset, use `getOrders`. Parameters passed into API filter objects are camel-cased and serialized before being sent as [API parameters](https://docs.opensea.io/v2.0/reference):

```typescript
import { OrderSide } from "opensea-js";

// Get offers
const { orders, count } = await openseaSDK.api.getOrders({
  assetContractAddress: tokenAddress,
  tokenId,
  side: OrderSide.OFFER,
});

// Get listings
const { orders, count } = await openseaSDK.api.getOrders({
  assetContractAddress: tokenAddress,
  tokenId,
  side: OrderSide.LISTING,
});
```

Note that the listing price of an asset is equal to the `currentPrice` of the **lowest listing** on the asset. Users can lower their listing price without invalidating previous listings, so all get shipped down until they're canceled or one is fulfilled.

### Fetching an Order by Hash

If you have an order hash, you can fetch the full order details directly:

```typescript
const order = await openseaSDK.api.getOrder({
  side: OrderSide.LISTING,
  orderHash: "0x...",
  chain: openseaSDK.chain,
  protocolAddress: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC", // Seaport 1.6
});
```

This is useful when you need to retrieve order details for operations like order cancellation or fulfillment when you only have the order hash.

### Fetching All Offers and Listings for a Collection

There are dedicated methods that return all offers and listings for a given collection:

```typescript
// Get all offers for a collection
const { offers } = await openseaSDK.api.getAllOffers("boredapeyachtclub");

// Get all listings for a collection
const { listings } = await openseaSDK.api.getAllListings("boredapeyachtclub");
```

Both methods support pagination with `limit` and `next` parameters.

### Fetching Best Offers and Best Listings for an NFT

Get the best (highest offer / lowest listing) for a specific NFT:

```typescript
// Get best offer for an NFT
const offer = await openseaSDK.api.getBestOffer("boredapeyachtclub", "1");

// Get best listing for an NFT
const listing = await openseaSDK.api.getBestListing("boredapeyachtclub", "1");
```

## Fetching Events

The SDK provides methods to retrieve historical events for NFTs, collections, and accounts. Events include sales, transfers, listings, offers, and cancellations.

### Get All Events

Fetch all events with optional filters:

```typescript
import { AssetEventType } from "opensea-js";

const { asset_events, next } = await openseaSDK.api.getEvents({
  event_type: AssetEventType.SALE, // Optional: filter by event type
  limit: 50, // Optional: limit results (default: 50)
  after: 1672531200, // Optional: filter events after timestamp
  before: 1675209600, // Optional: filter events before timestamp
  chain: "ethereum", // Optional: filter by chain
  next: "cursor", // Optional: cursor for pagination
});
```

**Event Types:**

- `AssetEventType.SALE` - Sales of NFTs
- `AssetEventType.TRANSFER` - Transfers of NFTs
- `AssetEventType.ORDER` - New listings and offers
- `AssetEventType.CANCEL` - Canceled orders
- `AssetEventType.REDEMPTION` - NFT redemptions

### Get Events by Account

Fetch events for a specific account address:

```typescript
const { asset_events } = await openseaSDK.api.getEventsByAccount(
  "0x...", // Account address
  {
    event_type: AssetEventType.SALE,
    limit: 20,
  },
);
```

### Get Events by Collection

Fetch events for a specific collection:

```typescript
const { asset_events } = await openseaSDK.api.getEventsByCollection(
  "cool-cats-nft", // Collection slug
  {
    event_type: AssetEventType.ORDER,
    limit: 100,
  },
);
```

### Get Events by NFT

Fetch events for a specific NFT:

```typescript
import { Chain } from "opensea-js";

const { asset_events } = await openseaSDK.api.getEventsByNFT(
  Chain.Mainnet, // Chain
  "0x...", // Contract address
  "1", // Token ID
  {
    event_type: AssetEventType.SALE,
  },
);
```

**Event Data:**

Each event includes:

- `event_type`: Type of event (sale, transfer, order, etc.)
- `event_timestamp`: When the event occurred (Unix timestamp)
- `chain`: Which blockchain the event occurred on
- `quantity`: Number of items involved

For **sale events**, additional fields include:

- `transaction`: Transaction hash
- `seller` and `buyer`: Wallet addresses
- `payment`: Payment amount and token details
- `nft`: NFT details

For **order events** (listings/offers), additional fields include:

- `order_type`: "listing", "item_offer", "collection_offer", or "trait_offer"
- `maker` and `taker`: Wallet addresses
- `payment`: Offer/listing amount
- `expiration_date`: When the order expires
- `is_private_listing`: Whether it's a private listing

For **transfer events**, additional fields include:

- `from_address` and `to_address`: Wallet addresses
- `transaction`: Transaction hash
- `nft`: NFT details

**Pagination:**

Use the `next` cursor to fetch additional pages:

```typescript
let cursor: string | undefined;
const allEvents = [];

do {
  const response = await openseaSDK.api.getEvents({
    event_type: AssetEventType.SALE,
    limit: 50,
    next: cursor,
  });

  allEvents.push(...response.asset_events);
  cursor = response.next;
} while (cursor);
```

## Buying Items

To buy an item, you need to **fulfill a listing**. To do that, it's just one call:

```typescript
import { OrderSide } from "opensea-js";

const order = await openseaSDK.api.getOrder({
  side: OrderSide.LISTING,
  orderHash: "0x...",
});

const accountAddress = "0x..."; // The buyer's wallet address
const transactionHash = await openseaSDK.fulfillOrder({
  order,
  accountAddress,
});
```

Note that the `fulfillOrder` promise resolves when the transaction has been confirmed and mined to the blockchain. To get the transaction hash before this happens, add an event listener for the `TransactionCreated` event (see the Advanced Use Cases guide for details on listening to events).

If the order is a listing, the taker is the _buyer_ and this will prompt the buyer to pay for the item(s).

## Accepting Offers

Similar to fulfilling listings above, you need to fulfill an offer on an item you own to receive the tokens in the offer.

```typescript
import { OrderSide } from "opensea-js";

const order = await openseaSDK.api.getOrder({
  side: OrderSide.OFFER,
  orderHash: "0x...",
});

const accountAddress = "0x..."; // The owner's wallet address
await openseaSDK.fulfillOrder({ order, accountAddress });
```

If the order is an offer, then the taker is the _owner_ and this will prompt the owner to exchange their item(s) for whatever is being offered in return.
