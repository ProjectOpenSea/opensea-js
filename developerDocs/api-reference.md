---
title: API Reference
category: 64cbb5277b5f3c0065d96616
slug: opensea-sdk-api-reference
parentDocSlug: opensea-sdk
order: 4
hidden: false
---

# OpenSea API Reference

This comprehensive reference documents all OpenSea API endpoints available through the opensea-js SDK. The SDK provides convenient TypeScript methods to interact with the OpenSea API v2.

- [NFT Endpoints](#nft-endpoints)
- [Collection Endpoints](#collection-endpoints)
- [Listing Endpoints](#listing-endpoints)
- [Offer Endpoints](#offer-endpoints)
- [Order Endpoints](#order-endpoints)
- [Account Endpoints](#account-endpoints)
- [Event Endpoints](#event-endpoints)

---

## NFT Endpoints

### Get NFT

Fetch metadata, traits, ownership information, and rarity for a single NFT.

```typescript
const { nft } = await openseaSDK.api.getNFT(
  "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", // Contract address
  "1", // Token ID
  Chain.Mainnet, // Optional: defaults to SDK's configured chain
);

console.log(nft.name);
console.log(nft.image_url);
console.log(nft.traits);
```

**Parameters:**

| Parameter    | Type   | Required | Description                                           |
| ------------ | ------ | -------- | ----------------------------------------------------- |
| `address`    | string | Yes      | The NFT contract address                              |
| `identifier` | string | Yes      | The token ID                                          |
| `chain`      | Chain  | No       | The blockchain (defaults to chain set in constructor) |

**Returns:** `GetNFTResponse` containing:

- `nft`: NFT object with metadata, traits, owners, rarity, etc.

---

### Get NFTs by Collection

Fetch multiple NFTs for a collection with pagination support.

```typescript
const { nfts, next } = await openseaSDK.api.getNFTsByCollection(
  "boredapeyachtclub", // Collection slug
  50, // Limit
  undefined, // Next cursor for pagination
);

console.log(`Fetched ${nfts.length} NFTs`);
```

**Parameters:**

| Parameter | Type   | Required | Description                             |
| --------- | ------ | -------- | --------------------------------------- |
| `slug`    | string | Yes      | Collection slug (identifier)            |
| `limit`   | number | No       | Number of NFTs to retrieve (1-50)       |
| `next`    | string | No       | Pagination cursor from previous request |

**Returns:** `ListNFTsResponse` containing:

- `nfts`: Array of NFT objects
- `next`: Cursor for next page (if available)

---

### Get NFTs by Contract

Fetch multiple NFTs for a specific contract address.

```typescript
const { nfts, next } = await openseaSDK.api.getNFTsByContract(
  "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  50,
  undefined,
  Chain.Mainnet,
);
```

**Parameters:**

| Parameter | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| `address` | string | Yes      | The NFT contract address               |
| `limit`   | number | No       | Number of NFTs to retrieve (1-50)      |
| `next`    | string | No       | Pagination cursor                      |
| `chain`   | Chain  | No       | The blockchain (defaults to SDK chain) |

**Returns:** `ListNFTsResponse` with NFTs array and pagination cursor.

---

### Get NFTs by Account

Fetch NFTs owned by a specific account address.

```typescript
const { nfts, next } = await openseaSDK.api.getNFTsByAccount(
  "0xfBa662e1a8e91a350702cF3b87D0C2d2Fb4BA57F", // Wallet address
  50,
  undefined,
  Chain.Mainnet,
);

console.log(`Account owns ${nfts.length} NFTs`);
```

**Parameters:**

| Parameter | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| `address` | string | Yes      | The account/wallet address             |
| `limit`   | number | No       | Number of NFTs to retrieve (1-50)      |
| `next`    | string | No       | Pagination cursor                      |
| `chain`   | Chain  | No       | The blockchain (defaults to SDK chain) |

**Returns:** `ListNFTsResponse` with NFTs owned by the account.

---

### Refresh NFT Metadata

Force a metadata refresh for an NFT. Useful after updating metadata on-chain.

```typescript
await openseaSDK.api.refreshNFTMetadata(
  "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  "1",
  Chain.Mainnet,
);
```

**Parameters:**

| Parameter    | Type   | Required | Description                            |
| ------------ | ------ | -------- | -------------------------------------- |
| `address`    | string | Yes      | The NFT contract address               |
| `identifier` | string | Yes      | The token ID                           |
| `chain`      | Chain  | No       | The blockchain (defaults to SDK chain) |

**Returns:** Response object from the API.

**Note:** Metadata updates may take a few minutes to propagate.

---

### Get Contract

Fetch smart contract information including name, chain, and associated collection.

```typescript
const contract = await openseaSDK.api.getContract(
  "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  Chain.Mainnet,
);

console.log(contract.name); // "Bored Ape Yacht Club"
console.log(contract.collection); // "boredapeyachtclub"
console.log(contract.contract_standard); // "erc721"
```

**Parameters:**

| Parameter | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| `address` | string | Yes      | The contract address                   |
| `chain`   | Chain  | No       | The blockchain (defaults to SDK chain) |

**Returns:** `GetContractResponse` containing:

- `address`: Contract address
- `chain`: Blockchain name
- `collection`: Associated collection slug (if any)
- `name`: Contract name
- `contract_standard`: Token standard (e.g., "erc721", "erc1155")

---

## Collection Endpoints

### Get Collection

Fetch detailed information about a single collection including fees, traits, and social links.

```typescript
const collection = await openseaSDK.api.getCollection("boredapeyachtclub");

console.log(collection.name);
console.log(collection.total_supply);
console.log(collection.fees);
```

**Parameters:**

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| `slug`    | string | Yes      | Collection slug (identifier) |

**Returns:** `OpenSeaCollection` object with comprehensive collection data.

---

### Get Collections

Fetch a list of collections with filtering and sorting options.

```typescript
import { CollectionOrderByOption, Chain } from "opensea-js";

const { collections, next } = await openseaSDK.api.getCollections(
  CollectionOrderByOption.SEVEN_DAY_VOLUME, // Sort by 7-day volume
  Chain.Mainnet, // Filter by chain
  undefined, // Creator username filter
  false, // Include hidden collections
  100, // Limit
  undefined, // Next cursor
);
```

**Parameters:**

| Parameter         | Type                    | Required | Description                                 |
| ----------------- | ----------------------- | -------- | ------------------------------------------- |
| `orderBy`         | CollectionOrderByOption | No       | Sort option (defaults to CREATED_DATE)      |
| `chain`           | Chain                   | No       | Filter by blockchain                        |
| `creatorUsername` | string                  | No       | Filter by creator's OpenSea username        |
| `includeHidden`   | boolean                 | No       | Include hidden collections (default: false) |
| `limit`           | number                  | No       | Number of collections to return (1-100)     |
| `next`            | string                  | No       | Pagination cursor                           |

**Order By Options:**

- `CREATED_DATE`: Recently created collections
- `ONE_DAY_CHANGE`: 24-hour price change
- `SEVEN_DAY_VOLUME`: 7-day trading volume
- `SEVEN_DAY_CHANGE`: 7-day price change
- `NUM_OWNERS`: Number of unique owners
- `MARKET_CAP`: Market capitalization

**Returns:** `GetCollectionsResponse` containing:

- `collections`: Array of collection objects
- `next`: Pagination cursor

---

### Get Collection Stats

Fetch statistical data for a collection including floor price, volume, and sales.

```typescript
const stats = await openseaSDK.api.getCollectionStats("boredapeyachtclub");

console.log(stats.total.volume); // Total trading volume
console.log(stats.total.sales); // Total number of sales
console.log(stats.total.floor_price); // Current floor price
```

**Parameters:**

| Parameter | Type   | Required | Description                  |
| --------- | ------ | -------- | ---------------------------- |
| `slug`    | string | Yes      | Collection slug (identifier) |

**Returns:** `OpenSeaCollectionStats` with:

- `total`: All-time statistics
- `intervals`: Time-based statistics (1 day, 7 days, 30 days)

---

### Get Traits

Fetch all traits for a collection with their possible values and occurrence counts. Useful for building trait filters and rarity calculators.

```typescript
const { categories, counts } =
  await openseaSDK.api.getTraits("boredapeyachtclub");

// List all trait categories
console.log(Object.keys(categories)); // ["Background", "Fur", "Eyes", ...]

// Get counts for a specific trait
console.log(counts["Fur"]);
// { "Brown": 1234, "Black": 987, "Golden Brown": 456, ... }

// Calculate rarity
const totalNFTs = Object.values(counts["Fur"]).reduce((a, b) => a + b, 0);
const brownFurCount = counts["Fur"]["Brown"];
const rarity = (brownFurCount / totalNFTs) * 100;
console.log(`Brown Fur rarity: ${rarity.toFixed(2)}%`);
```

**Parameters:**

| Parameter        | Type   | Required | Description                  |
| ---------------- | ------ | -------- | ---------------------------- |
| `collectionSlug` | string | Yes      | Collection slug (identifier) |

**Returns:** `GetTraitsResponse` containing:

- `categories`: Object mapping trait types to their data type ("string", "number", or "date")
- `counts`: Object with trait counts for each category

**Use Cases:**

- Build trait filter interfaces
- Calculate trait rarity
- Display trait distribution charts
- Validate trait offers

---

## Listing Endpoints

### Get All Listings

Get all active listings for a collection with pagination.

```typescript
const { listings, next } = await openseaSDK.api.getAllListings(
  "boredapeyachtclub",
  100, // Limit
  undefined, // Next cursor
);

listings.forEach((listing) => {
  console.log(`Price: ${listing.price.current.value}`);
  console.log(
    `Token ID: ${listing.protocol_data.parameters.offer[0].identifierOrCriteria}`,
  );
});
```

**Parameters:**

| Parameter        | Type   | Required | Description                              |
| ---------------- | ------ | -------- | ---------------------------------------- |
| `collectionSlug` | string | Yes      | Collection slug (identifier)             |
| `limit`          | number | No       | Number of listings (1-100, default: 100) |
| `next`           | string | No       | Pagination cursor                        |

**Returns:** `GetListingsResponse` containing:

- `listings`: Array of listing objects
- `next`: Cursor for next page

---

### Get Best Listing

Get the best (lowest price) active listing for a specific NFT.

```typescript
const listing = await openseaSDK.api.getBestListing("boredapeyachtclub", "1");

console.log(`Best price: ${listing.price.current.value}`);
console.log(`Seller: ${listing.protocol_data.parameters.offerer}`);
```

**Parameters:**

| Parameter        | Type             | Required | Description     |
| ---------------- | ---------------- | -------- | --------------- |
| `collectionSlug` | string           | Yes      | Collection slug |
| `tokenId`        | string \| number | Yes      | Token ID        |

**Returns:** `GetBestListingResponse` with the lowest-priced active listing.

---

### Get Best Listings

Get the best listings for each NFT in a collection.

```typescript
const { listings, next } = await openseaSDK.api.getBestListings(
  "boredapeyachtclub",
  100,
);
```

**Parameters:**

| Parameter        | Type   | Required | Description                |
| ---------------- | ------ | -------- | -------------------------- |
| `collectionSlug` | string | Yes      | Collection slug            |
| `limit`          | number | No       | Number of listings (1-100) |
| `next`           | string | No       | Pagination cursor          |

**Returns:** `GetListingsResponse` with best listings.

---

### Get NFT Listings

Get all active listings for a specific NFT (not just the best one). Useful for showing all selling options.

```typescript
const { listings, next } = await openseaSDK.api.getNFTListings(
  "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", // Contract address
  "1", // Token ID
  50, // Limit
  undefined, // Next cursor
  Chain.Mainnet,
);

console.log(`Found ${listings.length} active listings for this NFT`);

listings.forEach((listing) => {
  const price = listing.price.current.value;
  const decimals = listing.price.current.decimals;
  const priceInEth = parseFloat(price) / Math.pow(10, decimals);
  console.log(`Price: ${priceInEth} ETH`);
  console.log(`Remaining quantity: ${listing.remaining_quantity}`);
});
```

**Parameters:**

| Parameter              | Type   | Required | Description                        |
| ---------------------- | ------ | -------- | ---------------------------------- |
| `assetContractAddress` | string | Yes      | NFT contract address               |
| `tokenId`              | string | Yes      | Token ID                           |
| `limit`                | number | No       | Number of listings (1-100)         |
| `next`                 | string | No       | Pagination cursor                  |
| `chain`                | Chain  | No       | Blockchain (defaults to SDK chain) |

**Returns:** `GetListingsResponse` containing:

- `listings`: Array of all active listings for the NFT
- `next`: Pagination cursor

**Use Cases:**

- Display all available purchase options for an NFT
- Compare prices from different sellers
- Show partially filled listings

---

## Offer Endpoints

### Get All Offers

Get all active offers for a collection.

```typescript
const { offers, next } = await openseaSDK.api.getAllOffers(
  "boredapeyachtclub",
  100,
  undefined,
);

offers.forEach((offer) => {
  console.log(`Offer: ${offer.price.value} ${offer.price.currency}`);
});
```

**Parameters:**

| Parameter        | Type   | Required | Description                            |
| ---------------- | ------ | -------- | -------------------------------------- |
| `collectionSlug` | string | Yes      | Collection slug                        |
| `limit`          | number | No       | Number of offers (1-100, default: 100) |
| `next`           | string | No       | Pagination cursor                      |

**Returns:** `GetOffersResponse` containing:

- `offers`: Array of offer objects
- `next`: Pagination cursor

---

### Get Trait Offers

Get offers for NFTs with specific trait values.

```typescript
const { offers, next } = await openseaSDK.api.getTraitOffers(
  "boredapeyachtclub",
  "Fur", // Trait type
  "Golden Brown", // Trait value
  100, // Limit
  undefined, // Next
  undefined, // Float value (for numeric traits)
  undefined, // Int value (for numeric traits)
);
```

**Parameters:**

| Parameter        | Type   | Required | Description                      |
| ---------------- | ------ | -------- | -------------------------------- |
| `collectionSlug` | string | Yes      | Collection slug                  |
| `type`           | string | Yes      | Trait type/category name         |
| `value`          | string | Yes      | Trait value                      |
| `limit`          | number | No       | Number of offers (1-100)         |
| `next`           | string | No       | Pagination cursor                |
| `floatValue`     | number | No       | For decimal-based numeric traits |
| `intValue`       | number | No       | For integer-based numeric traits |

**Returns:** `GetOffersResponse` with trait-specific offers.

---

### Get Best Offer

Get the highest active offer for a specific NFT.

```typescript
const offer = await openseaSDK.api.getBestOffer("boredapeyachtclub", "1");

console.log(`Best offer: ${offer.price.value}`);
console.log(`Offerer: ${offer.protocol_data.parameters.offerer}`);
```

**Parameters:**

| Parameter        | Type             | Required | Description     |
| ---------------- | ---------------- | -------- | --------------- |
| `collectionSlug` | string           | Yes      | Collection slug |
| `tokenId`        | string \| number | Yes      | Token ID        |

**Returns:** `GetBestOfferResponse` with the highest offer.

---

### Get NFT Offers

Get all active offers for a specific NFT (not just the best one). Useful for showing all buying interest.

```typescript
const { offers, next } = await openseaSDK.api.getNFTOffers(
  "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", // Contract address
  "1", // Token ID
  50, // Limit
  undefined, // Next cursor
  Chain.Mainnet,
);

console.log(`Found ${offers.length} active offers for this NFT`);

offers.forEach((offer) => {
  const price = offer.price.value;
  const decimals = offer.price.decimals;
  const priceInEth = parseFloat(price) / Math.pow(10, decimals);
  const offerer = offer.protocol_data.parameters.offerer;
  console.log(`${priceInEth} ETH from ${offerer}`);
});
```

**Parameters:**

| Parameter              | Type   | Required | Description                        |
| ---------------------- | ------ | -------- | ---------------------------------- |
| `assetContractAddress` | string | Yes      | NFT contract address               |
| `tokenId`              | string | Yes      | Token ID                           |
| `limit`                | number | No       | Number of offers (1-100)           |
| `next`                 | string | No       | Pagination cursor                  |
| `chain`                | Chain  | No       | Blockchain (defaults to SDK chain) |

**Returns:** `GetOffersResponse` containing:

- `offers`: Array of all active offers for the NFT
- `next`: Pagination cursor

**Use Cases:**

- Display all offers received on an NFT
- Find highest bidders
- Show offer history and interest level

---

### Build Offer

Build criteria offer data for collection or trait offers.

```typescript
const offerData = await openseaSDK.api.buildOffer(
  "0x...", // Offerer address
  1, // Quantity
  "boredapeyachtclub", // Collection slug
  true, // Offer protection enabled
  "Fur", // Optional: trait type
  "Golden Brown", // Optional: trait value
);
```

**Parameters:**

| Parameter                | Type    | Required | Description                               |
| ------------------------ | ------- | -------- | ----------------------------------------- |
| `offererAddress`         | string  | Yes      | Wallet making the offer                   |
| `quantity`               | number  | Yes      | Number of NFTs requested                  |
| `collectionSlug`         | string  | Yes      | Collection slug                           |
| `offerProtectionEnabled` | boolean | No       | Use OpenSea's signed zone (default: true) |
| `traitType`              | string  | No       | Trait name for trait offers               |
| `traitValue`             | string  | No       | Trait value for trait offers              |

**Returns:** `BuildOfferResponse` with partial order parameters.

---

### Get Collection Offers

Get all collection-level offers for a collection.

```typescript
const response = await openseaSDK.api.getCollectionOffers("boredapeyachtclub");

if (response) {
  response.offers.forEach((offer) => {
    console.log(`Collection offer: ${offer.price.value}`);
  });
}
```

**Parameters:**

| Parameter | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| `slug`    | string | Yes      | Collection slug |

**Returns:** `ListCollectionOffersResponse` or `null`.

---

### Post Collection Offer

Submit a collection or trait offer to OpenSea.

```typescript
const offer = await openseaSDK.api.postCollectionOffer(
  orderProtocolData, // ProtocolData object
  "boredapeyachtclub", // Collection slug
  "Fur", // Optional: trait type
  "Golden Brown", // Optional: trait value
);
```

**Parameters:**

| Parameter    | Type         | Required | Description                  |
| ------------ | ------------ | -------- | ---------------------------- |
| `order`      | ProtocolData | Yes      | Signed order data            |
| `slug`       | string       | Yes      | Collection slug              |
| `traitType`  | string       | No       | Trait name for trait offers  |
| `traitValue` | string       | No       | Trait value for trait offers |

**Returns:** `CollectionOffer` object or `null`.

---

## Order Endpoints

### Get Order

Fetch a single order based on query parameters.

```typescript
import { OrderSide } from "opensea-js";

const order = await openseaSDK.api.getOrder({
  side: OrderSide.LISTING,
  assetContractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  tokenIds: ["1"],
  orderBy: "created_date",
  orderDirection: "desc",
});
```

**Parameters:**

All parameters from `OrdersQueryOptions` except `limit`:

| Parameter              | Type      | Required | Description                          |
| ---------------------- | --------- | -------- | ------------------------------------ |
| `side`                 | OrderSide | Yes      | LISTING or OFFER                     |
| `assetContractAddress` | string    | No       | Filter by NFT contract               |
| `tokenIds`             | string[]  | No       | Filter by token IDs                  |
| `maker`                | string    | No       | Filter by maker address              |
| `taker`                | string    | No       | Filter by taker address              |
| `orderBy`              | string    | No       | Sort field (default: "created_date") |
| `orderDirection`       | string    | No       | "asc" or "desc" (default: "desc")    |

**Returns:** Single `OrderV2` object.

**Throws:** Error if no matching order is found.

---

### Get Order by Hash

Fetch a single order by its unique hash.

```typescript
const order = await openseaSDK.api.getOrderByHash(
  "0x1234...", // Order hash
  "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC", // Seaport protocol address
  Chain.Mainnet, // Optional: chain
);

console.log(order.protocol_data.parameters);
```

**Parameters:**

| Parameter         | Type   | Required | Description                        |
| ----------------- | ------ | -------- | ---------------------------------- |
| `orderHash`       | string | Yes      | Order hash identifier              |
| `protocolAddress` | string | Yes      | Seaport contract address           |
| `chain`           | Chain  | No       | Blockchain (defaults to SDK chain) |

**Returns:** `OrderV2` object.

**Use Cases:**

- Retrieve order for fulfillment
- Check order status before cancellation
- Fetch order details for UI display

---

### Get Orders

Fetch multiple orders with filtering and pagination.

```typescript
const { orders, next } = await openseaSDK.api.getOrders({
  side: OrderSide.OFFER,
  maker: "0x...",
  orderBy: "eth_price",
  orderDirection: "desc",
});

console.log(`Found ${orders.length} orders`);
```

**Parameters:**

Same as `getOrder` plus:

| Parameter           | Type   | Required | Description                          |
| ------------------- | ------ | -------- | ------------------------------------ |
| All getOrder params | ...    | ...      | ...                                  |
| `limit`             | number | No       | Results per page (uses SDK pageSize) |

**Returns:** `GetOrdersResponse` containing:

- `orders`: Array of OrderV2 objects
- `next`: Pagination cursor

---

### Generate Fulfillment Data

Generate the data needed to fulfill a listing or offer on-chain.

```typescript
const fulfillmentData = await openseaSDK.api.generateFulfillmentData(
  "0x...", // Fulfiller address
  "0x1234...", // Order hash
  "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC", // Protocol address
  OrderSide.LISTING,
  "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", // Optional: asset contract
  "1", // Optional: token ID
);
```

**Parameters:**

| Parameter              | Type      | Required | Description                 |
| ---------------------- | --------- | -------- | --------------------------- |
| `fulfillerAddress`     | string    | Yes      | Wallet fulfilling the order |
| `orderHash`            | string    | Yes      | Order hash                  |
| `protocolAddress`      | string    | Yes      | Seaport contract address    |
| `side`                 | OrderSide | Yes      | LISTING or OFFER            |
| `assetContractAddress` | string    | No       | For criteria offers         |
| `tokenId`              | string    | No       | For criteria offers         |

**Returns:** `FulfillmentDataResponse` with transaction data.

---

### Post Order

Submit a signed order to OpenSea.

```typescript
const order = await openseaSDK.api.postOrder(
  protocolData, // Signed Seaport order
  {
    protocol: "seaport",
    side: "ask", // "ask" for listing, "bid" for offer
    protocolAddress: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC",
  },
);
```

**Parameters:**

| Parameter    | Type            | Required | Description              |
| ------------ | --------------- | -------- | ------------------------ |
| `order`      | ProtocolData    | Yes      | Seaport protocol data    |
| `apiOptions` | OrderAPIOptions | Yes      | Order submission options |

**API Options:**

| Field             | Type   | Required | Description              |
| ----------------- | ------ | -------- | ------------------------ |
| `protocol`        | string | No       | "seaport" (default)      |
| `side`            | string | Yes      | "ask" or "bid"           |
| `protocolAddress` | string | Yes      | Seaport contract address |

**Returns:** `OrderV2` object for the submitted order.

---

### Offchain Cancel Order

Cancel an order off-chain (gas-free) when protected by SignedZone.

```typescript
const result = await openseaSDK.api.offchainCancelOrder(
  "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC", // Protocol address
  "0x1234...", // Order hash
  Chain.Mainnet, // Optional: chain
  "0xabcd...", // Optional: offerer signature
);

console.log(
  `Last signature valid until: ${result.last_signature_issued_valid_until}`,
);
```

**Parameters:**

| Parameter          | Type   | Required | Description                        |
| ------------------ | ------ | -------- | ---------------------------------- |
| `protocolAddress`  | string | Yes      | Seaport contract address           |
| `orderHash`        | string | Yes      | Order hash to cancel               |
| `chain`            | Chain  | No       | Blockchain (defaults to SDK chain) |
| `offererSignature` | string | No       | EIP-712 signature from offerer     |

**Returns:** `CancelOrderResponse` with cancellation details.

**Important Notes:**

- Only works for SignedZone-protected orders
- No gas fees required
- If signature not provided, API key must belong to order offerer
- Cancellation only assured if no fulfillment signature was vended

---

## Account Endpoints

### Get Account

Fetch account profile information from OpenSea.

```typescript
const account = await openseaSDK.api.getAccount(
  "0xfBa662e1a8e91a350702cF3b87D0C2d2Fb4BA57F",
);

console.log(account.address);
console.log(account.username);
console.log(account.profile_image_url);
```

**Parameters:**

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| `address` | string | Yes      | Wallet address |

**Returns:** `OpenSeaAccount` object with profile data.

---

### Get Payment Token

Fetch details about a payment token (ERC20) used on OpenSea.

```typescript
const token = await openseaSDK.api.getPaymentToken(
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH address
  Chain.Mainnet,
);

console.log(token.symbol); // "WETH"
console.log(token.decimals); // 18
console.log(token.usd_price); // Current USD price
```

**Parameters:**

| Parameter | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| `address` | string | Yes      | Token contract address             |
| `chain`   | Chain  | No       | Blockchain (defaults to SDK chain) |

**Returns:** `OpenSeaPaymentToken` with token metadata and pricing.

---

## Event Endpoints

Events include sales, transfers, listings, offers, and cancellations.

### Get Events

Fetch all events with optional filtering.

```typescript
import { AssetEventType } from "opensea-js";

const { asset_events, next } = await openseaSDK.api.getEvents({
  event_type: AssetEventType.SALE,
  limit: 50,
  after: 1672531200, // Unix timestamp
  before: 1675209600, // Unix timestamp
  chain: "ethereum",
});

asset_events.forEach((event) => {
  if (event.event_type === "sale") {
    console.log(`Sale: ${event.payment.quantity} at ${event.event_timestamp}`);
  }
});
```

**Parameters:**

| Parameter    | Type                     | Required | Description                  |
| ------------ | ------------------------ | -------- | ---------------------------- |
| `event_type` | AssetEventType \| string | No       | Filter by event type         |
| `after`      | number                   | No       | Events after Unix timestamp  |
| `before`     | number                   | No       | Events before Unix timestamp |
| `limit`      | number                   | No       | Number of events to return   |
| `next`       | string                   | No       | Pagination cursor            |
| `chain`      | string                   | No       | Filter by blockchain         |

**Event Types:**

- `"sale"` - NFT sales
- `"transfer"` - NFT transfers
- `"mint"` - NFT mints
- `"listing"` - Item listings
- `"offer"` - Item offers
- `"trait_offer"` - Trait-based offers
- `"collection_offer"` - Collection offers

**Returns:** `GetEventsResponse` containing:

- `asset_events`: Array of event objects
- `next`: Pagination cursor

---

### Get Events by Account

Fetch events for a specific account.

```typescript
const { asset_events } = await openseaSDK.api.getEventsByAccount(
  "0xfBa662e1a8e91a350702cF3b87D0C2d2Fb4BA57F",
  {
    event_type: AssetEventType.SALE,
    limit: 100,
  },
);
```

**Parameters:**

| Parameter | Type          | Required | Description             |
| --------- | ------------- | -------- | ----------------------- |
| `address` | string        | Yes      | Account address         |
| `args`    | GetEventsArgs | No       | Event filtering options |

**Returns:** `GetEventsResponse` with account events.

---

### Get Events by Collection

Fetch events for a specific collection.

```typescript
const { asset_events } = await openseaSDK.api.getEventsByCollection(
  "boredapeyachtclub",
  {
    event_type: AssetEventType.SALE,
    limit: 100,
    after: Math.floor(Date.now() / 1000) - 86400, // Last 24 hours
  },
);

// Calculate total volume in last 24 hours
let totalVolume = 0n;
asset_events.forEach((event) => {
  if (event.event_type === "sale") {
    totalVolume += BigInt(event.payment.quantity);
  }
});
```

**Parameters:**

| Parameter        | Type          | Required | Description             |
| ---------------- | ------------- | -------- | ----------------------- |
| `collectionSlug` | string        | Yes      | Collection slug         |
| `args`           | GetEventsArgs | No       | Event filtering options |

**Returns:** `GetEventsResponse` with collection events.

---

### Get Events by NFT

Fetch events for a specific NFT.

```typescript
import { Chain } from "opensea-js";

const { asset_events } = await openseaSDK.api.getEventsByNFT(
  Chain.Mainnet,
  "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
  "1",
  {
    event_type: AssetEventType.SALE,
  },
);

// Show sale history
asset_events.forEach((event) => {
  if (event.event_type === "sale") {
    const price = event.payment.quantity;
    const date = new Date(event.event_timestamp * 1000);
    console.log(`Sold for ${price} on ${date.toLocaleDateString()}`);
  }
});
```

**Parameters:**

| Parameter    | Type          | Required | Description             |
| ------------ | ------------- | -------- | ----------------------- |
| `chain`      | Chain         | Yes      | Blockchain              |
| `address`    | string        | Yes      | Contract address        |
| `identifier` | string        | Yes      | Token ID                |
| `args`       | GetEventsArgs | No       | Event filtering options |

**Returns:** `GetEventsResponse` with NFT events.

---

## Event Data Structures

### Sale Events

```typescript
{
  event_type: "sale",
  event_timestamp: 1234567890,
  chain: "ethereum",
  transaction: "0x...",
  seller: "0x...",
  buyer: "0x...",
  payment: {
    quantity: "1000000000000000000",
    token_address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    symbol: "ETH"
  },
  nft: { /* NFT details */ }
}
```

### Order Events (Listings/Offers)

```typescript
{
  event_type: "order",
  order_type: "listing" | "item_offer" | "collection_offer" | "trait_offer",
  event_timestamp: 1234567890,
  maker: "0x...",
  taker: "0x...",
  payment: { /* payment details */ },
  expiration_date: 1234567890,
  is_private_listing: false,
  asset: { /* NFT details or null for collection offers */ }
}
```

### Transfer Events

```typescript
{
  event_type: "transfer",
  event_timestamp: 1234567890,
  transaction: "0x...",
  from_address: "0x...",
  to_address: "0x...",
  nft: { /* NFT details */ }
}
```

---

## Pagination

Most list endpoints support pagination using cursor-based navigation:

```typescript
let cursor: string | undefined;
const allResults: any[] = [];

do {
  const response = await openseaSDK.api.getOrders({
    side: OrderSide.LISTING,
    next: cursor,
  });

  allResults.push(...response.orders);
  cursor = response.next;
} while (cursor);

console.log(`Fetched ${allResults.length} total results`);
```

---

## Rate Limiting

The SDK automatically handles rate limiting with exponential backoff:

- Detects 429 (Too Many Requests) and 599 (custom rate limit) status codes
- Respects `retry-after` header when present
- Automatically retries failed requests up to 3 times
- Logs rate limit encounters with retry delay

**Best Practices:**

- Use pagination to avoid large single requests
- Implement caching for frequently accessed data
- Use bulk operations when available
- Monitor your API usage in OpenSea dashboard

---

## Error Handling

```typescript
try {
  const order = await openseaSDK.api.getOrder({
    side: OrderSide.LISTING,
    assetContractAddress: "0x...",
    tokenIds: ["1"],
  });
} catch (error) {
  if (error.message.includes("Not found")) {
    console.log("No matching order found");
  } else if (error.statusCode === 429) {
    console.log("Rate limited, will retry automatically");
  } else {
    console.error("API error:", error.message);
  }
}
```

---

## Common Patterns

### Check if NFT has Active Listings

```typescript
const { listings } = await openseaSDK.api.getNFTListings(
  contractAddress,
  tokenId,
  1, // Just need to know if any exist
);

const hasListings = listings.length > 0;
```

### Find Best Price for NFT

```typescript
const bestListing = await openseaSDK.api.getBestListing(
  collectionSlug,
  tokenId,
);
const bestOffer = await openseaSDK.api.getBestOffer(collectionSlug, tokenId);

const listingPrice = parseFloat(bestListing.price.current.value);
const offerPrice = parseFloat(bestOffer.price.value);

console.log(`Spread: ${listingPrice - offerPrice} wei`);
```

### Build Trait Filter

```typescript
const { categories, counts } = await openseaSDK.api.getTraits(collectionSlug);

// Create filter UI
Object.keys(categories).forEach((traitType) => {
  const values = Object.keys(counts[traitType]);
  console.log(`${traitType}: ${values.join(", ")}`);
});
```

---

For more examples and use cases, see the [Getting Started Guide](getting-started.md) and [Advanced Use Cases](advanced-use-cases.md).
