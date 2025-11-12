# OpenSea API Audit & opensea-js Cross-Check

This document catalogs all OpenSea API v2 endpoints, their parameters, and response schemas. The goal is to cross-reference each endpoint with the opensea-js implementation to ensure complete coverage.

**Last Updated**: 2025-11-10

---

## Executive Summary

This audit documents **35 REST API endpoints** across the OpenSea API v2:

- **Analytics Endpoints**: 5 endpoints (Events and Stats)
- **NFT Endpoints**: 12 endpoints (Accounts, Collections, NFTs, Metadata)
- **Marketplace Endpoints**: 18 endpoints (Offers, Listings, Orders)

### Current Status

- All endpoint URLs and basic parameters have been documented
- Path parameters are complete for all endpoints
- Query parameters need detailed extraction (marked as TBD)
- Response schemas need complete field-level documentation
- **Cross-check with opensea-js completed** - See [API_COVERAGE_MATRIX.md](./API_COVERAGE_MATRIX.md)

### Coverage Summary

**Overall Coverage: 94% (33/35 endpoints implemented)**

| Category    | Coverage    | Details                                                 |
| ----------- | ----------- | ------------------------------------------------------- |
| Analytics   | 100% (5/5)  | All event and stats endpoints implemented               |
| NFT         | 92% (11/12) | Missing: dedicated metadata endpoint (likely redundant) |
| Marketplace | 94% (17/18) | 1 endpoint has response type discrepancy                |

### Key Findings

#### API Documentation

1. OpenSea API documentation uses interactive "Try It!" features, limiting automated schema extraction
2. Most endpoints support pagination (needs documentation)
3. Multi-chain support across endpoints (ethereum, polygon, arbitrum, etc.)
4. Authentication uses `X-API-KEY` header consistently
5. Seaport protocol is the primary trading protocol

#### opensea-js Implementation

1. **High Coverage**: 94% of documented endpoints are implemented
2. **Well-Architected**: Clean modular design with domain-specific API clients
3. **Type-Safe**: Comprehensive TypeScript type definitions
4. **Enhanced Features**: Adds capabilities beyond API docs (private listings, multi-trait offers)
5. **Rate Limiting**: Built-in rate limit handling with retry-after support
6. **HTTP Client**: Uses ethers.js `FetchRequest` (not fetch/axios)

### Missing/Discrepant Endpoints

1. **GET /api/v2/metadata/{chain}/{contractAddress}/{tokenId}** (Endpoint #13)
   - Status: ❌ Not implemented
   - Likely redundant with `getNFT()` which returns full metadata
   - Action: Verify if unique data exists

2. **GET /api/v2/offers/collection/{slug}** (Endpoint #32)
   - Status: ⚠️ Implemented with different response type
   - Implementation uses `ListCollectionOffersResponse` vs expected `GetOffersResponse`
   - Action: Verify actual API response format

### opensea-js Enhancements

Features in opensea-js not documented in API:

- `includePrivateListings` parameter for listing endpoints
- Multi-trait offer support via `traits[]` array
- Enhanced error handling with retry logic
- Automatic rate limiting

### Next Phase

- Verify request/response type definitions match actual API behavior
- Test endpoint integrations with real API calls
- Document opensea-js-specific enhancements
- Consider implementing missing metadata endpoint if needed

---

## Analytics Endpoints

### 1. Get Collection Stats

**Endpoint**: `GET /api/v2/collections/{slug}/stats`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug

**Query Parameters**: TBD

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: TBD (needs detailed extraction)

**Future Work**:

- [ ] Extract complete query parameters
- [ ] Document full response schema with field types
- [ ] Verify opensea-js implementation exists
- [ ] Compare parameter coverage in opensea-js
- [ ] Test endpoint response matches types

---

### 2. Get Events (by Collection)

**Endpoint**: `GET /api/v2/events/collection/{slug}`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug

**Query Parameters**:

- Event type filtering (TBD)
- Date range filters (TBD)
- Pagination (limit, offset) (TBD)
- Sorting options (TBD)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: TBD (returns list of events)

**Future Work**:

- [ ] Extract complete query parameters with types
- [ ] Document full response schema
- [ ] Document event object structure
- [ ] Verify opensea-js implementation
- [ ] Compare parameter coverage
- [ ] Test pagination behavior

---

### 3. Get Events (by NFT)

**Endpoint**: `GET /api/v2/events/chain/{chain}/contract/{address}/nfts/{identifier}`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier (e.g., "ethereum", "polygon")
- `address` (string, required): Smart contract address
- `identifier` (string, required): NFT token identifier

**Query Parameters**: TBD

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: TBD (returns list of events for specific NFT)

**Future Work**:

- [ ] Document supported chain values
- [ ] Extract query parameters (pagination, filters)
- [ ] Document full response schema
- [ ] Verify opensea-js implementation
- [ ] Test multi-chain support

---

### 4. Get Events (by Account)

**Endpoint**: `GET /api/v2/events/accounts/{address}`

**Path Parameters**:

- `address` (string, required): Account address to retrieve events for

**Query Parameters**: TBD

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: TBD (returns list of events for account)

**Future Work**:

- [ ] Extract complete query parameters
- [ ] Document full response schema
- [ ] Verify opensea-js implementation
- [ ] Test address format handling

---

### 5. Get All Events

**Endpoint**: `GET /api/v2/events`

**Path Parameters**: None

**Query Parameters**:

- `event_type` (string, optional): Filter by specific event type
- Time range filters (TBD)
- Pagination (TBD)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: TBD (returns list of events with optional filtering)

**Future Work**:

- [ ] Document all event_type values
- [ ] Extract complete query parameters
- [ ] Document full response schema
- [ ] Verify opensea-js implementation
- [ ] Test filtering combinations

---

## NFT Endpoints

### 6. Get OpenSea Account Profile

**Endpoint**: `GET /api/v2/accounts/{address_or_username}`

**Path Parameters**:

- `address_or_username` (string, required): Wallet address or OpenSea username

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns account profile including:

- Bio/description
- Social media usernames
- Profile image
- Additional account details

**Future Work**:

- [ ] Document complete response schema with field types
- [ ] Verify opensea-js implementation
- [ ] Test both address and username formats

---

### 7. Get Single Collection

**Endpoint**: `GET /api/v2/collections/{slug}`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns collection including:

- Fees
- Traits
- Links
- Collection metadata

**Future Work**:

- [ ] Document complete response schema with field types
- [ ] Verify opensea-js implementation
- [ ] Test response structure

---

### 8. Get Multiple Collections

**Endpoint**: `GET /api/v2/collections`

**Path Parameters**: None

**Query Parameters**:

- Filters (TBD)
- Sorting options (TBD)
- Pagination (TBD)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns list of collections

**Future Work**:

- [ ] Document all query parameters (filters, sorting, pagination)
- [ ] Document complete response schema
- [ ] Verify opensea-js implementation

---

### 9. Get Contract

**Endpoint**: `GET /api/v2/chain/{chain}/contract/{address}`

**Path Parameters**:

- `chain` (string, required): Blockchain identifier (ethereum, polygon, arbitrum, etc.)
- `address` (string, required): Smart contract address

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns contract metadata including:

- Collection information
- Contract standards
- Ownership details

**Future Work**:

- [ ] Document supported chain values
- [ ] Document complete response schema
- [ ] Verify opensea-js implementation

---

### 10. Get Payment Token

**Endpoint**: `GET /api/v2/chain/{chain}/payment_token/{address}`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `address` (string, required): Payment token contract address

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns payment token details

**Future Work**:

- [ ] Document complete response schema
- [ ] Document supported payment tokens
- [ ] Verify opensea-js implementation

---

### 11. Refresh NFT Metadata

**Endpoint**: `POST /api/v2/chain/{chain}/contract/{address}/nfts/{identifier}/refresh`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `address` (string, required): Smart contract address
- `identifier` (string, required): NFT token identifier

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Request Body**: None documented

**Response Schema**: Queues metadata refresh operation

**Future Work**:

- [ ] Document request/response schemas
- [ ] Document refresh status polling
- [ ] Verify opensea-js implementation

---

### 12. Get Collection Traits

**Endpoint**: `GET /api/v2/traits/{slug}`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns trait data including:

- Available traits for collection
- Value counts for each trait
- Data types for trait values

**Future Work**:

- [ ] Document complete response schema with field types
- [ ] Verify opensea-js implementation
- [ ] Test trait filtering capabilities

---

### 13. Get NFT Metadata

**Endpoint**: `GET /api/v2/metadata/{chain}/{contractAddress}/{tokenId}`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `contractAddress` (string, required): Smart contract address
- `tokenId` (string, required): NFT token identifier

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns NFT metadata including:

- `name` (string): NFT display name
- `description` (string): Detailed information
- `image` (string): Visual representation URL
- `traits` (array): Attributes/properties
- `external_links` (array): URLs to external resources

**Future Work**:

- [ ] Document complete field types
- [ ] Verify opensea-js implementation
- [ ] Test metadata refresh behavior

---

### 14. Get NFTs by Collection

**Endpoint**: `GET /api/v2/collection/{slug}/nfts`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug

**Query Parameters**: TBD (likely pagination, filters)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns list of NFTs in collection

**Future Work**:

- [ ] Document query parameters (pagination, trait filters)
- [ ] Document complete response schema
- [ ] Verify opensea-js implementation

---

### 15. Get NFT

**Endpoint**: `GET /api/v2/chain/{chain}/contract/{address}/nfts/{identifier}`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `address` (string, required): Smart contract address
- `identifier` (string, required): NFT token identifier

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns comprehensive NFT information including:

- Metadata and trait details
- Ownership information
- Rarity data

**Future Work**:

- [ ] Document complete response schema with field types
- [ ] Verify opensea-js implementation
- [ ] Test multi-chain support

---

### 16. Get NFTs by Contract

**Endpoint**: `GET /api/v2/chain/{chain}/contract/{address}/nfts`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `address` (string, required): Smart contract address

**Query Parameters**: TBD (likely pagination)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns all NFTs for specific contract

**Future Work**:

- [ ] Document query parameters (pagination)
- [ ] Document complete response schema
- [ ] Verify opensea-js implementation

---

### 17. Get NFTs by Account

**Endpoint**: `GET /api/v2/chain/{chain}/account/{address}/nfts`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `address` (string, required): Account wallet address

**Query Parameters**: Collection filtering options (TBD)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns all NFTs owned by account with optional collection filtering

**Future Work**:

- [ ] Document query parameters (collection filter, pagination)
- [ ] Document complete response schema
- [ ] Verify opensea-js implementation

---

## Marketplace Endpoints

### 18. Build Offer v2 (Build Criteria Offer)

**Endpoint**: `POST /api/v2/offers/build`

**Path Parameters**: None

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Request Body**: TBD (merkle tree data for criteria-based offers)

**Response Schema**: Returns portion of criteria offer including merkle tree data

**Description**: Build a portion of a criteria offer including the merkle tree needed to post an offer

**Future Work**:

- [ ] Document request body schema
- [ ] Document response schema with field types
- [ ] Document merkle tree structure requirements
- [ ] Verify opensea-js implementation

---

### 19. Create Criteria Offer (POST)

**Endpoint**: `POST /api/v2/offers`

**Path Parameters**: None

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Request Body**: TBD (criteria offer parameters)

**Response Schema**: TBD

**Description**: Create a criteria offer to purchase any NFT in a collection or which matches specified trait(s)

**Future Work**:

- [ ] Document request body schema (trait criteria, price, duration)
- [ ] Document response schema
- [ ] Test single vs multiple trait offers
- [ ] Verify opensea-js implementation

---

### 20. Create Item Offer (POST)

**Endpoint**: `POST /api/v2/orders/{chain}/{protocol}/offers`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `protocol` (string, required): Protocol specification (e.g., "seaport")

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Request Body**: TBD (offer parameters for specific NFT)

**Response Schema**: TBD

**Description**: Create an offer to purchase a single NFT (ERC721 or ERC1155)

**Future Work**:

- [ ] Document request body schema
- [ ] Document response schema
- [ ] Document protocol parameter values
- [ ] Verify opensea-js implementation

---

### 21. Fulfill Offer (Generate Fulfillment Data)

**Endpoint**: `POST /api/v2/offers/fulfillment_data`

**Path Parameters**: None

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Request Body**: TBD (offer details to fulfill)

**Response Schema**: Returns signatures and data needed for onchain fulfillment

**Description**: Retrieve all information, including signatures, needed to fulfill an offer directly onchain

**Future Work**:

- [ ] Document request body schema
- [ ] Document response schema (signatures, transaction data)
- [ ] Verify opensea-js implementation
- [ ] Test fulfillment flow

---

### 22. Get Item Offers

**Endpoint**: `GET /api/v2/orders/{chain}/{protocol}/offers`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `protocol` (string, required): Trading protocol specification

**Query Parameters**: TBD (likely item identifier, pagination)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns all offers for a specific item

**Future Work**:

- [ ] Document query parameters (item identifier, filters, pagination)
- [ ] Document complete response schema
- [ ] Verify opensea-js implementation

---

### 23. Get Listings

**Endpoint**: `GET /api/v2/orders/{chain}/{protocol}/listings`

**Path Parameters**:

- `chain` (string, required): Blockchain network (ethereum, polygon, solana, etc.)
- `protocol` (string, required): Protocol identifier (e.g., "seaport")

**Query Parameters**: TBD (likely item identifier, pagination)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns all listings for a specific item

**Future Work**:

- [ ] Document query parameters (item identifier, filters, pagination)
- [ ] Document complete response schema
- [ ] Document supported protocol values
- [ ] Verify opensea-js implementation

---

### 24. Create Listing (POST)

**Endpoint**: `POST /api/v2/orders/{chain}/{protocol}/listings`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `protocol` (string, required): Protocol specification (e.g., "seaport")

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Request Body**: TBD (listing parameters)

**Response Schema**: TBD

**Description**: List a single NFT (ERC721 or ERC1155) for sale on the OpenSea marketplace

**Future Work**:

- [ ] Document request body schema (price, duration, NFT details)
- [ ] Document response schema
- [ ] Test ERC721 vs ERC1155 differences
- [ ] Verify opensea-js implementation

---

### 25. Cancel Order

**Endpoint**: `POST /api/v2/orders/chain/{chain}/protocol/{protocol_address}/{order_hash}/cancel`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `protocol_address` (string, required): Protocol address to prevent hash collisions
- `order_hash` (string, required): Unique hash of order to cancel

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Request Body**: None documented

**Response Schema**: TBD

**Description**: Offchain cancel a single order, offer or listing, by its order hash when protected by SignedZone. Note: cancellation is only assured if a fulfillment signature was not vended prior to cancellation

**Future Work**:

- [ ] Document request/response schemas
- [ ] Document SignedZone requirements
- [ ] Test cancellation edge cases
- [ ] Verify opensea-js implementation

---

### 26. Generate Listing Fulfillment Data v2

**Endpoint**: `POST /api/v2/listings/fulfillment_data`

**Path Parameters**: None

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Request Body**: TBD (listing details to fulfill)

**Response Schema**: Returns signatures and data needed for onchain fulfillment

**Description**: Retrieve all information, including signatures, needed to fulfill a listing directly onchain

**Future Work**:

- [ ] Document request body schema
- [ ] Document response schema (signatures, transaction data)
- [ ] Verify opensea-js implementation
- [ ] Test fulfillment flow

---

### 27. Get Order

**Endpoint**: `GET /api/v2/orders/chain/{chain}/protocol/{protocol_address}/{order_hash}`

**Path Parameters**:

- `chain` (string, required): Blockchain network identifier
- `protocol_address` (string, required): Smart contract address for protocol
- `order_hash` (string, required): Unique hash identifying the order

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns single order object

**Description**: Get a single order by its order hash

**Future Work**:

- [ ] Document complete response schema
- [ ] Test with various order types
- [ ] Verify opensea-js implementation

---

### 28. Get Offers by Collection Trait

**Endpoint**: `GET /api/v2/offers/collection/{slug}/traits`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug

**Query Parameters**: TBD (trait specifications, single or multiple)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns trait offers for collection with specified trait(s)

**Description**: Get trait offers for a collection with the specified trait(s), supporting single or multiple traits

**Future Work**:

- [ ] Document query parameters for trait filtering
- [ ] Document complete response schema
- [ ] Test single vs multiple trait queries
- [ ] Verify opensea-js implementation

---

### 29. Get Best Offer (NFT)

**Endpoint**: `GET /api/v2/offers/collection/{slug}/nfts/{identifier}/best`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug
- `identifier` (string, required): NFT identifier within collection

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns the highest offer for the NFT

**Description**: Get the best offer for an NFT

**Future Work**:

- [ ] Document complete response schema
- [ ] Test offer ranking logic
- [ ] Verify opensea-js implementation

---

### 30. Get Offers (NFT)

**Endpoint**: `GET /api/v2/offers/collection/{slug}/nfts/{identifier}`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug
- `identifier` (string, required): NFT identifier within collection

**Query Parameters**: TBD (likely pagination)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns all offers for specific NFT

**Description**: Get all offers for a specific NFT

**Future Work**:

- [ ] Document query parameters (pagination, sorting)
- [ ] Document complete response schema
- [ ] Verify opensea-js implementation

---

### 31. List All Offers (Collection)

**Endpoint**: `GET /api/v2/offers/collection/{slug}/all`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug

**Query Parameters**: TBD (likely pagination)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns all offers for the collection

**Description**: Get all offers for a collection

**Future Work**:

- [ ] Document query parameters (pagination, filters)
- [ ] Document complete response schema
- [ ] Verify opensea-js implementation

---

### 32. Get Offers (Collection)

**Endpoint**: `GET /api/v2/offers/collection/{slug}`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug

**Query Parameters**: TBD (likely filters, pagination)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns offers for the collection

**Description**: Get offers for a collection

**Future Work**:

- [ ] Document query parameters (filters, pagination)
- [ ] Document complete response schema
- [ ] Clarify difference with endpoint #31
- [ ] Verify opensea-js implementation

---

### 33. Get Best Listing (NFT)

**Endpoint**: `GET /api/v2/listings/collection/{slug}/nfts/{identifier}/best`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug
- `identifier` (string, required): NFT identifier within collection

**Query Parameters**: None documented

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns the best listing for the NFT

**Description**: Get the best listing for an NFT

**Future Work**:

- [ ] Document complete response schema
- [ ] Test listing ranking logic (lowest price?)
- [ ] Verify opensea-js implementation

---

### 34. Get Best Listings (Collection)

**Endpoint**: `GET /api/v2/listings/collection/{slug}/best`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug

**Query Parameters**: TBD (likely pagination, filters)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns the best listings for collection ordered by price

**Description**: Get the best listings for a collection by price

**Future Work**:

- [ ] Document query parameters (limit, filters)
- [ ] Document complete response schema
- [ ] Verify opensea-js implementation

---

### 35. List All Listings (Collection)

**Endpoint**: `GET /api/v2/listings/collection/{slug}/all`

**Path Parameters**:

- `slug` (string, required): Collection identifier/slug

**Query Parameters**: TBD (likely pagination)

**Headers**:

- `X-API-KEY` (required): API authentication key

**Response Schema**: Returns all listings for the collection

**Description**: Get all listings for a collection

**Future Work**:

- [ ] Document query parameters (pagination, filters)
- [ ] Document complete response schema
- [ ] Verify opensea-js implementation

---

## Overall Progress Tracking

### Documentation Phase

- [x] Create initial planning document structure
- [x] Complete Analytics endpoints documentation (5/5 endpoints documented)
- [x] Complete NFT endpoints documentation (12/12 endpoints documented)
- [x] Complete Marketplace endpoints documentation (18/18 endpoints documented)
- [ ] Extract detailed query parameters for all endpoints
- [ ] Extract complete response schemas for all endpoints
- [ ] Document all supported chain values (ethereum, polygon, arbitrum, base, etc.)
- [ ] Document all protocol parameter values (seaport, etc.)

### Cross-Check Phase

- [x] Audit opensea-js API client methods
- [x] Map each endpoint to opensea-js implementation
- [x] Identify missing endpoints in opensea-js
- [x] Identify deprecated endpoints in opensea-js
- [x] Compare parameter names and types
- [x] Document API coverage percentage
- [x] Create detailed coverage matrix (see [API_COVERAGE_MATRIX.md](./API_COVERAGE_MATRIX.md))
- [ ] Verify request/response type definitions match actual API
- [ ] Test each endpoint integration
- [ ] Create issues for missing implementations
- [ ] Update opensea-js TypeScript types if needed

### Testing Phase (Future Work)

- [ ] Create test suite for each endpoint
- [ ] Verify error handling
- [ ] Test rate limiting behavior
- [ ] Test pagination on list endpoints
- [ ] Test filter combinations
- [ ] Verify authentication flows
- [ ] Test multi-chain support

---

## Notes

- OpenSea API documentation uses interactive "Try It!" features, making automated extraction challenging
- Many endpoints lack detailed parameter documentation in the static pages
- Need to investigate actual API responses to document complete schemas
- Header authentication appears to use `X-API-KEY` (needs verification)
- Most endpoints support pagination (limit/offset or cursor-based) - needs documentation
- Chain parameter values need comprehensive documentation (ethereum, polygon, arbitrum, etc.)

---

## Next Steps

1. **Extract detailed schemas** - Use API testing to capture complete query parameters and response schemas
2. **Begin opensea-js code audit** - Search through opensea-js codebase to map implementations
3. **Create comparison matrix** - Build a table showing endpoint coverage in opensea-js
4. **Identify gaps** - Document missing or deprecated endpoints
5. **Update type definitions** - Ensure TypeScript types match current API v2 responses
