# OpenSea API Coverage Matrix

This document maps the 35 documented OpenSea API v2 endpoints against the opensea-js implementation.

**Legend:**

- ✅ **Implemented** - Endpoint is fully implemented in opensea-js
- ⚠️ **Partial** - Endpoint exists but with different interface or limited functionality
- ❌ **Missing** - Endpoint not implemented in opensea-js
- 🔄 **Alternative** - Different method name or approach used

---

## Analytics Endpoints (5/5 = 100% Coverage)

| #   | Endpoint                                                                | Status | opensea-js Method                                             | File                | Notes               |
| --- | ----------------------------------------------------------------------- | ------ | ------------------------------------------------------------- | ------------------- | ------------------- |
| 1   | `GET /api/v2/collections/{slug}/stats`                                  | ✅     | `api.collections.getCollectionStats(slug)`                    | `collections.ts:63` | Full implementation |
| 2   | `GET /api/v2/events/collection/{slug}`                                  | ✅     | `api.events.getEventsByCollection(slug, args)`                | `events.ts:45`      | Full implementation |
| 3   | `GET /api/v2/events/chain/{chain}/contract/{address}/nfts/{identifier}` | ✅     | `api.events.getEventsByNFT(chain, address, identifier, args)` | `events.ts:59`      | Full implementation |
| 4   | `GET /api/v2/events/accounts/{address}`                                 | ✅     | `api.events.getEventsByAccount(address, args)`                | `events.ts:31`      | Full implementation |
| 5   | `GET /api/v2/events`                                                    | ✅     | `api.events.getEvents(args)`                                  | `events.ts:20`      | Full implementation |

---

## NFT Endpoints (12/12 = 100% Coverage)

| #   | Endpoint                                                                  | Status | opensea-js Method                                                                             | File                | Notes                                        |
| --- | ------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------- |
| 6   | `GET /api/v2/accounts/{address_or_username}`                              | ✅     | `api.accounts.getAccount(address)`                                                            | `accounts.ts:31`    | Full implementation                          |
| 7   | `GET /api/v2/collections/{slug}`                                          | ✅     | `api.collections.getCollection(slug)`                                                         | `collections.ts:27` | Full implementation                          |
| 8   | `GET /api/v2/collections`                                                 | ✅     | `api.collections.getCollections(orderBy, chain, creatorUsername, includeHidden, limit, next)` | `collections.ts:36` | Full implementation with rich parameters     |
| 9   | `GET /api/v2/chain/{chain}/contract/{address}`                            | ✅     | `api.nfts.getContract(address, chain)`                                                        | `nfts.ts:112`       | Full implementation                          |
| 10  | `GET /api/v2/chain/{chain}/payment_token/{address}`                       | ✅     | `api.accounts.getPaymentToken(address, chain)`                                                | `accounts.ts:18`    | Full implementation                          |
| 11  | `POST /api/v2/chain/{chain}/contract/{address}/nfts/{identifier}/refresh` | ✅     | `api.nfts.refreshNFTMetadata(address, identifier, chain)`                                     | `nfts.ts:96`        | Full implementation                          |
| 12  | `GET /api/v2/traits/{slug}`                                               | ✅     | `api.collections.getTraits(collectionSlug)`                                                   | `collections.ts:72` | Full implementation                          |
| 13  | `GET /api/v2/metadata/{chain}/{contractAddress}/{tokenId}`                | ❌     | N/A                                                                                           | N/A                 | **MISSING** - No dedicated metadata endpoint |
| 14  | `GET /api/v2/collection/{slug}/nfts`                                      | ✅     | `api.nfts.getNFTsByCollection(slug, limit, next)`                                             | `nfts.ts:25`        | Full implementation                          |
| 15  | `GET /api/v2/chain/{chain}/contract/{address}/nfts/{identifier}`          | ✅     | `api.nfts.getNFT(address, identifier, chain)`                                                 | `nfts.ts:82`        | Full implementation (includes metadata)      |
| 16  | `GET /api/v2/chain/{chain}/contract/{address}/nfts`                       | ✅     | `api.nfts.getNFTsByContract(address, limit, next, chain)`                                     | `nfts.ts:43`        | Full implementation                          |
| 17  | `GET /api/v2/chain/{chain}/account/{address}/nfts`                        | ✅     | `api.nfts.getNFTsByAccount(address, limit, next, chain)`                                      | `nfts.ts:62`        | Full implementation                          |

**Note**: Endpoint #13 (Get NFT Metadata) appears to be redundant with endpoint #15 (Get NFT), which returns comprehensive NFT information including metadata. opensea-js uses getNFT() for this purpose.

---

## Marketplace Endpoints (16/18 = 89% Coverage)

| #   | Endpoint                                                                            | Status | opensea-js Method                                                                                                        | File             | Notes                                  |
| --- | ----------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------- | -------------------------------------- |
| 18  | `POST /api/v2/offers/build`                                                         | ✅     | `api.offers.buildOffer(offererAddress, quantity, collectionSlug, offerProtectionEnabled, traitType, traitValue, traits)` | `offers.ts:95`   | Full implementation with trait support |
| 19  | `POST /api/v2/offers`                                                               | ✅     | `api.offers.postCollectionOffer(order, slug, traitType, traitValue, traits)`                                             | `offers.ts:157`  | Full implementation                    |
| 20  | `POST /api/v2/orders/{chain}/{protocol}/offers`                                     | ✅     | `api.orders.postOrder(order, apiOptions)`                                                                                | `orders.ts:174`  | Full implementation (side='bid')       |
| 21  | `POST /api/v2/offers/fulfillment_data`                                              | ✅     | `api.orders.generateFulfillmentData(fulfillerAddress, orderHash, protocolAddress, OrderSide.OFFER, ...)`                 | `orders.ts:131`  | Full implementation                    |
| 22  | `GET /api/v2/orders/{chain}/{protocol}/offers`                                      | ✅     | `api.orders.getOrders({ side: OrderSide.OFFER, ... })`                                                                   | `orders.ts:90`   | Full implementation                    |
| 23  | `GET /api/v2/orders/{chain}/{protocol}/listings`                                    | ✅     | `api.orders.getOrders({ side: OrderSide.LISTING, ... })`                                                                 | `orders.ts:90`   | Full implementation                    |
| 24  | `POST /api/v2/orders/{chain}/{protocol}/listings`                                   | ✅     | `api.orders.postOrder(order, apiOptions)`                                                                                | `orders.ts:174`  | Full implementation (side='ask')       |
| 25  | `POST /api/v2/orders/chain/{chain}/protocol/{protocol_address}/{order_hash}/cancel` | ✅     | `api.orders.offchainCancelOrder(protocolAddress, orderHash, chain, offererSignature)`                                    | `orders.ts:216`  | Full implementation                    |
| 26  | `POST /api/v2/listings/fulfillment_data`                                            | ✅     | `api.orders.generateFulfillmentData(fulfillerAddress, orderHash, protocolAddress, OrderSide.LISTING, ...)`               | `orders.ts:131`  | Full implementation                    |
| 27  | `GET /api/v2/orders/chain/{chain}/protocol/{protocol_address}/{order_hash}`         | ✅     | `api.orders.getOrderByHash(orderHash, protocolAddress, chain)`                                                           | `orders.ts:76`   | Full implementation                    |
| 28  | `GET /api/v2/offers/collection/{slug}/traits`                                       | ✅     | `api.offers.getTraitOffers(collectionSlug, type, value, limit, next, floatValue, intValue)`                              | `offers.ts:56`   | Full implementation                    |
| 29  | `GET /api/v2/offers/collection/{slug}/nfts/{identifier}/best`                       | ✅     | `api.offers.getBestOffer(collectionSlug, tokenId)`                                                                       | `offers.ts:82`   | Full implementation                    |
| 30  | `GET /api/v2/offers/collection/{slug}/nfts/{identifier}`                            | ✅     | `api.offers.getNFTOffers(assetContractAddress, tokenId, limit, next, chain)`                                             | `offers.ts:180`  | Full implementation                    |
| 31  | `GET /api/v2/offers/collection/{slug}/all`                                          | ✅     | `api.offers.getAllOffers(collectionSlug, limit, next)`                                                                   | `offers.ts:38`   | Full implementation                    |
| 32  | `GET /api/v2/offers/collection/{slug}`                                              | ✅     | `api.offers.getCollectionOffers(slug, limit, next)`                                                                      | `offers.ts:145`  | Full implementation with pagination    |
| 33  | `GET /api/v2/listings/collection/{slug}/nfts/{identifier}/best`                     | ✅     | `api.listings.getBestListing(collectionSlug, tokenId, includePrivateListings)`                                           | `listings.ts:53` | Full implementation                    |
| 34  | `GET /api/v2/listings/collection/{slug}/best`                                       | ✅     | `api.listings.getBestListings(collectionSlug, limit, next, includePrivateListings)`                                      | `listings.ts:74` | Full implementation                    |
| 35  | `GET /api/v2/listings/collection/{slug}/all`                                        | ✅     | `api.listings.getAllListings(collectionSlug, limit, next, includePrivateListings)`                                       | `listings.ts:28` | Full implementation                    |

**Notes**:

- opensea-js provides additional `includePrivateListings` parameter for listing endpoints (not documented in API docs)

---

## Summary Statistics

| Category        | Total Endpoints | Implemented | Partial | Missing | Coverage % |
| --------------- | --------------- | ----------- | ------- | ------- | ---------- |
| **Analytics**   | 5               | 5           | 0       | 0       | **100%**   |
| **NFT**         | 12              | 11          | 0       | 1       | **92%**    |
| **Marketplace** | 18              | 18          | 0       | 0       | **100%**   |
| **TOTAL**       | **35**          | **34**      | **0**   | **1**   | **97%**    |

---

## Missing Endpoints

### 1. Get NFT Metadata (Endpoint #13)

- **API Endpoint**: `GET /api/v2/metadata/{chain}/{contractAddress}/{tokenId}`
- **Status**: ❌ Missing
- **Reason**: Likely redundant with endpoint #15 `getNFT()` which returns comprehensive NFT data including metadata
- **Recommendation**: Verify if this endpoint provides any additional data not available in `getNFT()`. If not, document that `getNFT()` should be used instead.

---

## Discrepancies & Notes

### 1. Private Listings Support

- **Feature**: opensea-js adds `includePrivateListings` parameter to listing endpoints
- **Status**: Not documented in OpenSea API docs
- **Impact**: Positive - additional functionality
- **Endpoints Affected**:
  - `getAllListings()` (listings.ts:28)
  - `getBestListing()` (listings.ts:53)
  - `getBestListings()` (listings.ts:74)
  - `getNFTListings()` (listings.ts:102)
- **Recommendation**: Document this feature in opensea-js docs

### 2. Multi-Trait Offers

- **Feature**: opensea-js supports array of traits via `traits` parameter
- **Status**: Enhanced beyond single trait API docs
- **Impact**: Positive - more flexible trait-based offers
- **Endpoints Affected**:
  - `buildOffer()` (offers.ts:95)
  - `postCollectionOffer()` (offers.ts:157)
- **Validation**: Enforces mutual exclusivity between `traits[]` and `traitType/traitValue` parameters
- **Recommendation**: Document this enhancement prominently

---

## Implementation Quality Notes

### Strengths

1. **Comprehensive Coverage**: 97% endpoint coverage with 34/35 endpoints implemented
2. **Type Safety**: Full TypeScript type definitions for all requests/responses
3. **Error Handling**: Robust validation (e.g., eth_price ordering requirements, protocol validation)
4. **Rate Limiting**: Built-in rate limit handling with retry-after support
5. **Dependency Injection**: Clean architecture with `Fetcher` interface
6. **Modular Design**: Well-organized into domain-specific API clients
7. **Enhanced Features**: Adds useful features like private listings and multi-trait offers

### Areas for Improvement

1. **Missing Metadata Endpoint**: Clarify if `/api/v2/metadata/...` is intentionally skipped
2. **Documentation**: Document opensea-js-specific enhancements (private listings, multi-traits)

---

## Recommendations

1. **Investigate Endpoint #13** (Get NFT Metadata)
   - Test if this endpoint returns data beyond what `getNFT()` provides
   - If redundant, document `getNFT()` as the canonical method
   - If unique, implement `getNFTMetadata()` method

2. **Document Enhancements**
   - Create documentation for `includePrivateListings` parameter
   - Document multi-trait offer support with examples
   - Highlight opensea-js features that go beyond API docs

3. **Future Considerations**
   - Monitor API changes for new endpoints
   - Keep type definitions synchronized with API responses
   - Consider implementing missing metadata endpoint if use case identified
