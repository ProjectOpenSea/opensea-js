# @opensea/sdk

## 10.4.0

### Minor Changes

- 94dbf08: Sync downstream packages to the API surface introduced in `@opensea/api-types` 0.3.0 (os2-core#40171 + #40190): drop methods backed by removed endpoints, fix POST shapes, and surface the four new endpoints (`/listings/sweep`, `/offers/collection/{slug}/nfts/{identifier}`, `/swap/execute`, `/transactions/receipt`).

  ### `@opensea/sdk` — breaking

  **Removed methods** (the underlying GET endpoints were deleted; they would return 404 against the new API):

  - `OpenSeaAPI.getOrder` / `OrdersAPI.getOrder` — was already `@deprecated`. Use `getBestOffer` / `getBestListing` for "best" or `getAllOffers` / `getAllListings` for collection-wide results.
  - `OpenSeaAPI.getOrders` / `OrdersAPI.getOrders` — was already `@deprecated`. Use `getAllOffers` / `getAllListings`.
  - `OpenSeaAPI.postOrder` / `OrdersAPI.postOrder` — was already `@deprecated`. Use `postListing` / `postOffer`.
  - `OpenSeaAPI.getNFTOffers` / `OffersAPI.getNFTOffers` — replaced by `getOffersByNFT(slug, tokenId)` (new endpoint takes a collection slug, not contract address).
  - `OpenSeaAPI.getNFTListings` / `ListingsAPI.getNFTListings` — no per-NFT all-listings endpoint exists. Use `getBestListing(slug, tokenId)` for the best, or `getAllListings(slug)` and filter client-side.
  - Helpers `getOrdersAPIPath`, `serializeOrdersQueryOptions`, `deserializeOrder` — orphaned with the methods above.
  - Types `OrderAPIOptions`, `OrdersQueryOptions`, `OrdersQueryResponse`, `OrdersPostQueryResponse`, `ListingPostQueryResponse`, `OfferPostQueryResponse`, `SerializedOrderV2`, `GetOrdersResponse` — unused after the deletions.
  - Stats fields `IntervalStat.{volume_diff, volume_change, sales_diff, average_price}` and `Stats.{market_cap, average_price}` — server stopped returning them (always `0` previously).

  **Behavior changes:**

  - `OrdersAPI.postListing` and `OrdersAPI.postOffer` now read the bare `Listing` / `Offer` response (the upstream API dropped the legacy `order` wrapper field).
  - `OpenSeaSDK.createOffer` returns `Promise<Offer>` (was `Promise<OrderV2>`).
  - `OpenSeaSDK.createListing` returns `Promise<Listing>` (was `Promise<OrderV2>`).
  - `OpenSeaSDK.createBulkListings` returns `Promise<BulkOrderResult<Listing>>`; `createBulkOffers` returns `Promise<BulkOrderResult<Offer>>`. `BulkOrderResult` is now generic in the success type.

  **New methods:**

  - `OpenSeaAPI.getOffersByNFT(slug, identifier, limit?, next?)` — all offers for one NFT.
  - `OpenSeaAPI.sweepCollection(request)` — bulk-buy items from a collection, any payment token (incl. cross-chain).
  - `OpenSeaAPI.executeSwap(request)` — multi-asset swap; companion to `getSwapQuote`.
  - `OpenSeaAPI.getTransactionReceipt(request)` — fetch transaction status (sweep, swap, fulfillment).
  - New `TransactionsAPI` sub-client.

  ### `@opensea/cli` — additive (with one type re-export removed)

  - `OrdersResponse`, `SimpleAccount` re-exports removed from `src/types/api.ts` (schemas no longer exist).
  - `offers all` and `listings all` now accept `--maker <address>` to filter by order maker.
  - New commands:
    - `listings sweep` — bulk-buy items from a collection with any payment token.
    - `offers by-nft <collection> <token-id>` — all offers for a specific NFT.
    - `transactions receipt --request <file>` — fetch transaction receipt/status (request body via JSON file).
  - New SDK helpers: `OpenSeaCLI.transactions.receipt`, `SwapsAPI.executeMulti` (POST `/swap/execute`).

  ### `@opensea/skill` — docs refresh

  - `opensea-api/references/rest-api.md` — endpoint tables refreshed: removed deleted GET rows, added `?maker=` annotations, added `listings/sweep`, per-NFT offers, `swap/execute`, and `transactions/receipt` rows.
  - `opensea-marketplace/references/marketplace-api.md` — replaced "Get listings/offers for specific NFT" sections (which curled the removed endpoints) with the slug-based replacements.

### Patch Changes

- Updated dependencies [7a51fd0]
  - @opensea/api-types@0.3.0

## 10.3.1

### Patch Changes

- 961f2c5: fix(api): consume cross-chain fulfillment types from `@opensea/api-types`

  The cross-chain fulfillment types added in the previous release were hand-rolled in `packages/sdk/src/api/types.ts` and `packages/cli/src/types/api.ts` rather than generated from the OpenAPI spec. This release pulls them from `@opensea/api-types` (the source of truth) so future spec changes flow through automatically.

  **`@opensea/api-types`**: Adds named exports for `CrossChainFulfillmentRequest`, `CrossChainFulfillmentResponse`, `CrossChainPaymentToken`, `FulfillerObject`, and `ListingObject` schemas (regenerated from the production OpenAPI spec).

  **`@opensea/sdk`** _(type rename — minimal-impact since the prior release shipped <1 day ago)_:

  - `CrossChainListing` → `ListingObject`
  - `CrossChainFulfillmentDataRequest` → `CrossChainFulfillmentRequest`
  - `CrossChainFulfillmentDataResponse` → `CrossChainFulfillmentResponse`
  - `CrossChainTransaction` → `SwapTransactionResponse`

  The runtime call signature on `BaseOpenSeaSDK.getCrossChainFulfillmentData()` is unchanged.

  **`@opensea/cli`** _(type rename — same minimal impact)_:

  - `CrossChainFulfillmentTransaction` → `SwapTransactionResponse`
  - `CrossChainFulfillmentDataResponse` → `CrossChainFulfillmentResponse`

  Adds a new blocking CI check (`pnpm check-api-paths`) that fails when an `/api/v2/...` URL referenced in SDK or CLI source is not present in `packages/api-types/opensea-api.json`. AGENTS docs updated to make the api-types-first flow explicit for new endpoints.

- Updated dependencies [961f2c5]
  - @opensea/api-types@0.2.3

## 10.3.0

### Minor Changes

- fc44d9f: feat: add cross-chain fulfillment support

  Add support for the new `POST /api/v2/listings/cross_chain_fulfillment_data` endpoint across SDK, CLI, and skill packages.

  **SDK**: New `getCrossChainFulfillmentData()` method on both the API client and the base SDK class. Accepts listings, fulfiller, payment token (chain + address), and optional recipient. Returns ordered transactions to sign and submit.

  **CLI**: New `listings cross-chain-fulfill` subcommand with `--hashes`, `--listing-chain`, `--protocol-address`, `--fulfiller`, `--payment-chain`, `--payment-token`, and optional `--recipient` flags. Supports sweeping multiple listings via comma-separated hashes.

  **Skill**: New `opensea-cross-chain-fulfill.sh` script and updated SKILL.md with cross-chain buying workflow documentation.

## 10.2.1

### Patch Changes

- 4a76bc1: Add server-side trait filtering on three collection-scoped read methods. `getNFTsByCollection`, `getBestListings`, and `getEventsByCollection` now accept an optional `traits` argument (a `TraitFilter[]`); multiple entries are AND-combined server-side. The SDK JSON-encodes the array for the request — callers pass a structured `[{ traitType, value }]`. New exports: `TraitFilter`, `GetEventsByCollectionArgs`, `encodeTraitsParam`. Requires `@opensea/api-types@^0.2.2`.

## 10.2.0

### Minor Changes

- bc9c6ce: Add token-groups and instant API key endpoints.

  **SDK**:

  - `sdk.api.getTokenGroups({ limit?, cursor? })` and `sdk.api.getTokenGroup(slug)` for the new `/api/v2/token-groups` endpoints.
  - `OpenSeaSDK.requestInstantApiKey()` and `OpenSeaAPI.requestInstantApiKey()` — static methods that call `POST /api/v2/auth/keys` without authentication and return a free-tier key you can pass into the SDK constructor. Rate limited to 3 keys/hour per IP; keys expire after 30 days.
  - `OpenSeaAPI` class is now exported from the package root (`@opensea/sdk` and `@opensea/sdk/viem`).

  **CLI**:

  - New `opensea token-groups list` and `opensea token-groups get <slug>` commands.
  - New `opensea auth request-key` command — works without `--api-key` / `OPENSEA_API_KEY` since the endpoint is unauthenticated.

### Patch Changes

- a57c63d: Update @opensea/seaport-js from ^4.0.7 to ^4.1.1
- Updated dependencies [5b6ba13]
  - @opensea/api-types@0.2.1

## 10.1.0

### Minor Changes

- 497b636: Add missing API wrapper methods for full OpenAPI spec coverage:
  - `getNFTCollection()` — get the collection an NFT belongs to
  - `getNFTMetadata()` — get raw NFT metadata (name, description, image, traits)
  - Expose `fulfillPrivateOrder()` as a public method on `OpenSeaSDK`

## 10.0.0

### Major Changes

- bc5b7b6: Add viem support via provider abstraction layer.

  Breaking changes:

  - `OrderSide.LISTING` value changed from `"ask"` to `"listing"`
  - `OrderSide.OFFER` value changed from `"bid"` to `"offer"`
  - `BigNumberish` type replaced with `Amount` (`string | number | bigint`)
  - `Overrides` type replaced with `Record<string, unknown>`
  - `provider` public property removed from `OpenSeaSDK` class
  - `estimateGas` utility function removed
  - TypeChain dependency removed (replaced with inline ABIs)
  - `ethers.FetchRequest` replaced with native `fetch()`

  New features:

  - `@opensea/sdk/viem` subpath export with native viem `PublicClient`/`WalletClient` support
  - Provider abstraction types: `OpenSeaSigner`, `OpenSeaProvider`, `ContractCaller`, `OpenSeaWallet`
  - `ZERO_ADDRESS` and `MAX_UINT256` exported from constants
  - `checksumAddress` utility using `@noble/hashes`
  - `parseUnits` and `parseEther` standalone utilities

## 9.0.0

### Major Changes

- Rename package from `opensea-js` to `@opensea/sdk`

  The old `opensea-js` package has been deprecated with a stub that directs users to install `@opensea/sdk` instead.

## 8.1.0

### Minor Changes

- b3a5e84: Add drops endpoints, trending/top collections, and account resolve

  - api-types: Sync OpenAPI spec with 6 new endpoints and 8 new schemas (drops, trending/top collections, account resolve)
  - SDK: New DropsAPI class, extended CollectionsAPI and AccountsAPI with new methods
  - CLI: New `drops` command, `collections trending/top` subcommands, `accounts resolve` subcommand

### Patch Changes

- f82c035: Replace hardcoded chain ID maps with codegen from OpenSea REST API

  - SDK: Fix Blast chain ID from 238 (testnet) to 81457 (mainnet)
  - CLI: Add chains previously only in SDK (b3, flow, ronin, etc.)
  - CLI: Remove `bsc`, `sepolia`, `base_sepolia`, `monad_testnet` from `CHAIN_IDS` — these are not in the OpenSea API
  - Add `pnpm sync-chains` codegen script (fetches GET /api/v2/chains as source of truth)

- Updated dependencies [b3a5e84]
  - @opensea/api-types@0.2.0
