---
title: Getting Started Guide
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
- [Fetching Events](#fetching-events)
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

**Creating Multiple Offers:** To create multiple offers efficiently with a single signature, see [Bulk Order Creation](advanced-use-cases.md#bulk-order-creation) in the Advanced Use Cases guide.

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

**Creating Multiple Listings:** To create multiple listings efficiently with a single signature, see [Bulk Order Creation](advanced-use-cases.md#bulk-order-creation) in the Advanced Use Cases guide.

### Creating Collection and Trait Offers

Criteria offers, consisting of collection and trait offers, are supported with `openseaSDK.createCollectionOffer()`.

For trait offers, include `traitType` as the trait name and `traitValue` as the required value for the offer.

```typescript
const collection = await sdk.api.getCollection("cool-cats-nft");
const offer = await openseaSDK.createCollectionOffer({
  collectionSlug: collection.collection,
  accountAddress: walletAddress,
  paymentTokenAddress: getOfferPaymentToken(sdk.chain),
  amount: 7,
  quantity: 1,
  traitType: "face",
  traitValue: "tvface bobross",
});
```

#### Creating English Auctions

**⚠️ Note: English auctions are no longer supported on OpenSea**

~~English Auctions are auctions that start at a small amount (we recommend even using 0!) and increase with every bid. At expiration time, the item sells to the highest bidder.~~

~~To create an English Auction set `englishAuction` to `true`:~~

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

~~Note that auctions aren't supported with Ether directly due to limitations in Ethereum, so you have to use an ERC20 token, like Wrapped Ether (WETH), a stablecoin like DAI, etc. See [Using ERC-20 Tokens Instead of Ether](#using-erc-20-tokens-instead-of-ether) for more info.~~

### Fetching Orders

To retrieve a list of offers and auctions on an asset, you can use `getOrders`. Parameters passed into API filter objects are camel-cased and serialized before being sent as [API parameters](https://docs.opensea.io/v2.0/reference):

```typescript
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

Note that the listing price of an asset is equal to the `currentPrice` of the **lowest listing** on the asset. Users can lower their listing price without invalidating previous listing, so all get shipped down until they're canceled, or one is fulfilled.

#### Fetching an Order by Hash

If you have an order hash, you can fetch the full order details directly:

```typescript
const order = await openseaSDK.api.getOrderByHash(
  orderHash,
  protocolAddress, // Seaport contract address
  chain, // Optional: defaults to the chain configured in the SDK
);
```

This is useful when you need to retrieve order details for operations like order cancellation or fulfillment when you only have the order hash.

#### Fetching All Offers and Listings for a given collection

There are two endpoints that return all offers and listings for a given collection, `getAllOffers` and `getAllListings`.

```typescript
const { offers } = await openseaSDK.api.getAllOffers(collectionSlug);
```

#### Fetching Best Offers and Best Listings for a given NFT

There are two endpoints that return the best offer or listing, `getBestOffer` and `getBestListing`.

```typescript
const offer = await openseaSDK.api.getBestOffer(collectionSlug, tokenId);
```

### Fetching Events

The SDK provides methods to retrieve historical events for NFTs, collections, and accounts. Events include sales, transfers, listings, offers, and cancellations.

#### Get All Events

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

#### Get Events by Account

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

#### Get Events by Collection

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

#### Get Events by NFT

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
const allEvents: AssetEvent[] = [];

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

### Buying Items

To buy an item, you need to **fulfill a listing**. To do that, it's just one call:

```typescript
const order = await openseaSDK.api.getOrder({ side: OrderSide.LISTING, ... })
const accountAddress = "0x..." // The buyer's wallet address, also the taker
const transactionHash = await openseaSDK.fulfillOrder({ order, accountAddress })
```

Note that the `fulfillOrder` promise resolves when the transaction has been confirmed and mined to the blockchain. To get the transaction hash before this happens, add an event listener (see [Listening to Events](#listening-to-events)) for the `TransactionCreated` event.

If the order is a listing, the taker is the _buyer_ and this will prompt the buyer to pay for the item(s).

### Accepting Offers

Similar to fulfilling listings above, you need to fulfill an offer (buy order) on an item you own to receive the tokens in the offer.

```typescript
const order = await openseaSDK.api.getOrder({ side: OrderSide.OFFER, ... })
const accountAddress = "0x..." // The owner's wallet address, also the taker
await openseaSDK.fulfillOrder({ order, accountAddress })
```

If the order is an offer, then the taker is the _owner_ and this will prompt the owner to exchange their item(s) for whatever is being offered in return.

See [Listening to Events](#listening-to-events) below to respond to the setup transactions that occur the first time a user accepts a bid.
