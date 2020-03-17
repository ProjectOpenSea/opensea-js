# Changelog

Full changelog coming soon. For now, here are the most important changes for doing major migrations:

## Migrating to version 1.1
- `OpenSeaPort::computeFees()` No longer accepts a `fees` parameter, relying solely on `asset`.

## Migrating to version 1.0

Version 1.0 introduces bundling for semi-fungible and fungible assets, serialized asset collections, a smaller bundle size, and more, along with many bug fixes.

**Breaking directory changes**
- Many constants inside of `/utils` have been moved to `/constants`.
- Other utils have been moved to `/utils/utils`

**Breaking type changes**
- `profile_img_url` in the `OpenSeaAccount` type has been renamed to `profileImgUrl`
- `OpenSeaPort::computeFees()` now returns a new type, `ComputedFees`, which expands "BPS" to "BasisPoints" for each of its member keys

**Breaking interface changes**
- `OpenSeaPort::computeFees()` now takes in a single asset, and returns a new and more consistent type, `ComputedFees`
- `schemaName` has been moved out of main method calls and into the `Asset` type
- `OpenSeaAPI::getAsset()` now accepts named arguments, consistent with other methods
- `OpenSeaPort::createFactorySellOrders` now accepts an `assets` parameter consistent with the other `Asset` type parameters in other methods
- `OpenSeaPort::getTokenBalance()` no longer defaults to the WETH address if no `tokenAddress` is set. And it accepts a `schemaName` parameter instead of an ABI
- `OpenSeaPort::approveNonFungibleToken()` has been renamed to `approveSemiOrNonFungibleToken()`, though it always worked for semi-fungible tokens like ERC-1155

**Removed deprecations:**
- `OpenSeaPort::transferOne()`, replaced by `OpenSeaPort::transfer()`
- `tokenId` and `tokenAddress` parameters for most SDK methods, replaced by creating an `Asset` type and passing that in

## Migrating to version 0.6

Version 0.6 introduces some major new features, including trading fungible and semi-fungible assets (including ERC-20 and ERC-1155 assets). These have been architected to maximize backwards compatibility, but there were a few breaking changes:

- The `Asset` type now has `version` instead of `nftVersion` as a property
- Similarly, the `NFTVersion` type has been renamed `TokenStandardVersion`
- `computeFees` now takes in a single, annotated OpenSeaAsset as a parameter instead of a list of assets
- In `isAssetTransferrable`, `didOwnerApprove` was renamed to `useProxy`

Non-breaking changes with deprecation notices:

- `getFungibleTokens` has been deprecated. Use `api.getPaymentTokens`
- Methods now show a deprecation warning when used with `tokenId` or `tokenAddress` as arguments, instead of using `asset` or `assets` (of type `Asset`/`Asset[]`)