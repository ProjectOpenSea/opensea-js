# @opensea/sdk

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
