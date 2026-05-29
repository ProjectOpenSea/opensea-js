# @opensea/sdk

## 11.1.1

### Patch Changes

- fix: correct `GetSwapQuoteArgs` to match the swap quote endpoint. `getSwapQuote` now takes `{ fromChain, fromAddress, toChain, toAddress, quantity, address, slippage?, recipient? }`, matching `GET /api/v2/swap/quote` (the previous `{ tokenIn, tokenOut, amount, chain }` shape did not map to the endpoint's query params).

## 11.1.0

### Minor Changes

- 8fa9fb5: Expose the new `token/{chain}/{address}/holders` and `token/{chain}/{address}/liquidity-pools` endpoints across SDK, CLI, and skill.

  ## SDK (`@opensea/sdk`)

  - `OpenSeaAPI.getTokenHolders(chain, address, args?)` → `TokenHoldersResponse` — paginated holders (`limit`, `cursor`, `sortBy: "QUANTITY"`, `sortDirection`) plus aggregate distribution health (`STRONG | HEALTHY | CONCERNING | BAD`).
  - `OpenSeaAPI.getTokenLiquidityPools(chain, address, args?)` → `TokenLiquidityPoolsResponse` — pools with pool type, USD reserves, bonding-curve progress, graduation flag.
  - New type exports: `TokenHoldersResponse`, `TokenHoldersArgs`, `TokenLiquidityPoolsResponse`, `TokenLiquidityPoolsArgs`.
  - New path helpers in `apiPaths.ts`: `getTokenHoldersPath`, `getTokenLiquidityPoolsPath`.

  ## CLI (`@opensea/cli`)

  - `opensea tokens holders <chain> <address> [--limit] [--next] [--sort-by] [--sort-direction]`
  - `opensea tokens liquidity-pools <chain> <address> [--limit]`
  - SDK class additions: `OpenSeaCLI.tokens.holders(...)`, `OpenSeaCLI.tokens.liquidityPools(...)`.
  - New type re-exports: `TokenHoldersResponse`, `TokenLiquidityPoolsResponse`.

  ## Skill (`@opensea/skill`)

  - `tokens/opensea-token-holders.sh <chain> <address> [limit] [cursor] [sort_by] [sort_direction]`
  - `tokens/opensea-token-liquidity-pools.sh <chain> <address> [limit]`
  - Documentation: added rows to `SKILL.md` (Investigation Scripts) and `references/rest-api.md` (Tokens).

  Bumps consume `@opensea/api-types` 0.4.3 (released alongside, see the spec-sync PR for full schema details).

### Patch Changes

- Updated dependencies [96928f4]
- Updated dependencies [90702a7]
  - @opensea/api-types@0.4.3

## 11.0.0

### Major Changes

- e7deba3: Rebuild the SDK's type layer on `@opensea/api-types` with automatic case translation at the fetcher boundary. Consumer API stays camelCase; underneath, the fetcher snakeizes outgoing query params and POST bodies and camelizes responses, so the SDK no longer ships hand-rolled response shapes.

  ## What changed

  ### Types are sourced from `@opensea/api-types`

  The Order family, NFT/Trait, Drop family, Collection, Account, Payment, Chain, Token, and event response shapes now derive directly from the generated OpenAPI types via a generic `Camelize<T>` mapper. When the API spec gains a field, the SDK type picks it up automatically — no per-endpoint converter to keep in sync. The old `utils/converters.ts` is gone.

  ### Case translation at the fetcher boundary

  `utils/case.ts` ships two utilities:

  - `camelizeKeysDeep<T>` / `Camelize<T>` — walks the API response and rewrites snake_case keys to camelCase.
  - `snakeizeKeysDeep<T>` / `Snakeize<T>` — the inverse, applied to query params and POST bodies on the way out.

  Consumers always see camelCase; the API always sees snake_case. No converter drift, no field-name typos.

  ### Narrowing intersections preserved

  Where the OpenAPI spec is too loose, the SDK still narrows:

  - `Listing.type` is the `OrderType` enum (spec ships plain `string`).
  - `Listing.status` / `Offer.status` are the `OrderStatus` enum.
  - `Order` / `Offer` / `Listing` `.protocolData` is the seaport-js `OrderWithCounter` (the SDK passes it directly to Seaport).

  ### Shape changes consumers should know about

  These come from aligning with what the API actually returns:

  - `Order.protocolData` and `Order.protocolAddress` are **optional**. They're populated on every endpoint except the profile listings/offers endpoints, where the API intentionally returns null for performance. Code that reads them unconditionally needs a guard.
  - `Order` base type no longer carries `price` — only `Offer` and `Listing` do (matching the API).
  - `Offer` and `Listing` gain `remainingQuantity` (required), `orderCreatedAt`, and `asset?: OrderAsset` (the field added in ProjectOpenSea/os2-core#42022 for profile endpoints).
  - `NFT` is now `NftDetailed` — gains `displayImageUrl`, `displayAnimationUrl`, `originalImageUrl`, `originalAnimationUrl`, `animationUrl`, `isSuspicious`, `subscription`, `owner.quantityString`. Drops stale `rarity.{score,calculatedAt,maxRank,tokensScored,rankingFeatures}` that weren't actually in the spec.
  - `TokenBalance` gains optional `status`, `baseTokenLiquidityUsd`, `quoteTokenLiquidityUsd`.
  - `RarityStrategy` is now `Camelize<Rarity>` from api-types — `{ strategyId, strategyVersion, rank? }`. The previous extra fields (`calculatedAt`, `maxRank`, `tokensScored`) were spec-incomplete patches.
  - `GetCollectionResponse` is now an alias for `OpenSeaCollection` — the previous `{ collection: OpenSeaCollection }` wrapper never matched the actual API response.
  - Acronym casing follows generic snake→camel rules: `is_nsfw` → `isNsfw` (not `isNSFW`).
  - `PaymentToken.image` (was `imageUrl`) — the spec uses `image`; the previous converter renamed it. Code reading `paymentToken.imageUrl` should switch to `paymentToken.image`.

  ### Removed

  - `utils/converters.ts` (`collectionFromJSON`, `accountFromJSON`, `paymentTokenFromJSON`, `feeFromJSON`, `rarityFromJSON`, `pricingCurrenciesFromJSON`) and the corresponding test file.

  ### Surfaces the new `Order.asset` field

  Profile endpoints (`/account/{address}/listings`, `/offers`, `/offers_received`) now expose `asset: { identifier?: string; contract: string }`, so consumers no longer have to parse Seaport `protocolData.parameters.offer[0]` to identify the NFT.

### Patch Changes

- fb03c09: Source `EventPayment`, `EventAsset`, `GetNFTResponse`, `BuildOfferResponse`, and `CancelOrderResponse` from `@opensea/api-types` instead of hand-rolling them. Same shapes consumers see today (after camelize at the fetcher), now auto-tracking the OpenAPI spec.

  - `EventPayment` → `Camelize<Payment>`
  - `EventAsset` → `Camelize<Nft>` (gains `original_image_url`, `original_animation_url`, and `traits` fields the API also returns)
  - `GetNFTResponse` → `Camelize<NftResponse>`
  - `BuildOfferResponse` → `Camelize<BuildOfferResponse>` (api-types ships this with camelCase keys natively)
  - `CancelOrderResponse` → `Camelize<CancelResponse>`

  The narrow event types (`ListingEvent`, `OfferEvent`, `TraitOfferEvent`, `CollectionOfferEvent`, `OrderEvent`, `MintEvent`, `SaleEvent`, `TransferEvent`) and `AssetEvent` union keep their existing SDK definitions — they're refinements that narrow `eventType` to specific enum values, which the api-types `OrderEvent`/`SaleEvent`/`TransferEvent` schemas don't model.

- 68b07cb: Fix critical bugs introduced by the api-types migration where unconditional body snakeize corrupted Seaport-shaped POST payloads.

  ## What was broken

  The OpenSea OpenAPI spec is **mixed-casing**: outer envelope keys are snake_case (`protocol_address`, `protocol_data`, `order_hash`) but inner Seaport struct keys are camelCase to mirror the on-chain struct (`parameters.startTime`, `parameters.endTime`, `parameters.orderType`, `parameters.zoneHash`, `parameters.conduitKey`, `parameters.totalOriginalConsiderationItems`, `parameters.offer[].itemType`, `parameters.offer[].identifierOrCriteria`, etc.). A few top-level request fields are also camelCase per spec: `CancelRequest.offererSignature`, `CriteriaObject.numericTraits`.

  The blanket `snakeizeKeysDeep(body)` at the fetcher boundary recursively rewrote every inner key to snake_case, breaking:

  - `postListing` / `postOffer` — Seaport `parameters` sent with snake_case keys the API rejected (or that no longer matched the EIP-712 signature digest).
  - `offchainCancelOrder` — `offererSignature` shipped as `offerer_signature`, silently dropping the cancel signature.
  - `buildOffer` / `postCollectionOffer` — `criteria.numericTraits` shipped as `numeric_traits`, broadening trait offers to the whole collection.

  ## Fix

  Added `snakeizeBody?: boolean` (default `true`) to the public `Fetcher.post()` method. Internal callsites whose wire bodies contain camelCase keys now pass `snakeizeBody: false` and emit bodies in exact wire shape:

  - `OrdersAPI.postListing`, `OrdersAPI.postOffer` — outer `protocol_address` snake_case; inner `parameters` preserved camelCase via spread of the Seaport `OrderWithCounter`.
  - `OrdersAPI.offchainCancelOrder` — body `{ offererSignature }` preserved.
  - `OffersAPI.buildOffer`, `OffersAPI.postCollectionOffer` — outer `protocol_address` / `protocol_data` / `offer_protection_enabled` snake_case; `criteria.numericTraits` preserved camelCase.

  The default behavior (snakeize-all) is unchanged for any caller of `api.post()` that doesn't hit a mixed-casing endpoint.

  ## Other related fixes

  - `OpenSeaAPI.requestInstantApiKey` (and the `OpenSeaSDK` passthrough) now camelizes its response — previously it called `fetch()` directly and returned snake_case despite the typed surface promising `{ apiKey, expiresAt, ... }`. JSDoc examples on both methods corrected.
  - `OpenSeaRateLimitError.responseBody` is now camelized to match the rest of the boundary contract.
  - `_fetch` error envelope is camelized before reading `.errors`, so nested snake_case keys no longer leak into thrown Error messages.
  - `camelToSnake` no longer emits a leading underscore for PascalCase / acronym keys (`URL` → `url`, `MyKey` → `my_key`). The corresponding `Snakeize<T>` type was updated to match the runtime.
  - `OpenSeaAccount.socialMediaAccounts` defends against the wire returning `null` (the previous hand-rolled converter did `?? []`; the new pipeline did not).
  - Dead-code OrderV2/Order casts dropped in `fulfillment.ts` — both branches read the same camelCase property after the migration.

  ## Tests

  Added 11 unit tests covering `snakeizeKeysDeep` (flat + nested objects, array walking, multi-segment, primitives, null/undefined, Date passthrough, top-level `offererSignature`/`protocolAddress` rewrite, position-0 guard). The previous test file imported only `camelizeKeysDeep` — the entire outbound translator had zero unit coverage, which is how these bugs slipped through.

  A new CI workflow (`.github/workflows/sdk-integration.yml`) runs the SDK integration suite nightly and on PRs labeled `run-integration`, so future fetcher-boundary regressions are caught against the live API.

- Updated dependencies [fb03c09]
  - @opensea/api-types@0.4.2

## 10.5.0

### Minor Changes

- 051b558: Surface 22 new endpoints added in `@opensea/api-types` 0.4.0 as SDK methods and CLI commands.

  **`@opensea/sdk`** — new methods on `OpenSeaAPI` (and the underlying domain clients):

  - `getTokensBatch`, `getNFTsBatch`, `getCollectionsBatch` — batch lookups
  - `createListingActions` — ordered approval + Seaport-sign actions for new listings
  - `deployDropContract`, `getDeployContractReceipt` — drop contract deployment
  - `transferAssets` — build transactions to transfer NFTs or tokens
  - `getCollectionOfferAggregates`, `getCollectionHolders`, `getCollectionFloorPrices` — collection analytics
  - `getTokenPriceHistory`, `getTokenOhlcv`, `getTokenActivity` — token analytics
  - `getNFTOwners`, `getNFTAnalytics` — NFT analytics
  - `getPortfolioStats`, `getPortfolioHistory`, `getProfileOffers`, `getProfileOffersReceived`, `getProfileListings`, `getProfileFavorites`, `getProfileCollections` — account profile

  New internal `AssetsAPI` client; new request/response types re-exported through `@opensea/sdk` (from `@opensea/api-types`).

  **`@opensea/cli`** — new commands on the existing `accounts`, `collections`, `nfts`, `tokens`, `listings`, `drops` subcommands, plus a new `assets transfer` subcommand. SDK class methods mirroring the same surface added to `OpenSeaCLI`.

  No removed endpoints; pure additive release.

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
