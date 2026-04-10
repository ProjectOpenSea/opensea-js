---
title: Frequently Asked Questions
category: 64cbb5277b5f3c0065d96616
slug: opensea-sdk-faq
parentDocSlug: opensea-sdk
order: 4
hidden: false
---

- [How do I access the source code?](#how-do-i-access-the-source-code)
- [What chains are supported?](#what-chains-are-supported)
- [Why is there no SDK method for the API request I am trying to call?](#why-is-there-no-sdk-method-for-the-api-request-i-am-trying-to-call)
- [Does the SDK support viem?](#does-the-sdk-support-viem)
- [What changed in v10?](#what-changed-in-v10)

## How do I access the source code?

The source code for the SDK can be found on [GitHub](https://github.com/ProjectOpenSea/opensea-js).

## What chains are supported?

See the `Chain` enum in [`src/types.ts`](https://github.com/ProjectOpenSea/opensea-js/blob/main/src/types.ts) for a complete list of supported chains.

Please use methods in the v2 API for multichain capabilities.

## Why is there no SDK method for the API request I am trying to call?

First, check the [API Reference](api-reference.md) to see all available SDK methods - many OpenSea API v2 endpoints are now supported.

If the SDK does not currently have a specific API, you can use the generic `get` and `post` methods on the `OpenSeaAPI` class in [`src/api/api.ts`](https://github.com/ProjectOpenSea/opensea-js/blob/main/src/api/api.ts) to make any API request. This repository is also open source, so please feel free to create a pull request.

## Does the SDK support viem?

Yes. Starting in v10, the SDK ships a dedicated `@opensea/sdk/viem` entry point. Import from that path and pass `{ publicClient }` (read-only) or `{ publicClient, walletClient }` (read + write) instead of an ethers provider/signer. See the [Quick Start Guide](quick-start.md) for full examples.

**Note on bundle size:** Even when using the viem entry point, ethers will appear in your `node_modules` as a transitive dependency of `@opensea/seaport-js`. Your application code never imports ethers directly, but the SDK uses it internally for Seaport protocol interactions. This is a known tradeoff until seaport-js adds native viem support.

## What changed in v10?

Key changes in v10:

- **Viem support** -- new `@opensea/sdk/viem` entry point that accepts `{ publicClient, walletClient }` instead of ethers `Signer | JsonRpcProvider`.
- **`OrderSide` values** -- changed from `"ask"`/`"bid"` to `"listing"`/`"offer"`.
- **`BigNumberish` replaced with `Amount`** -- the `Amount` type is `string | number | bigint`.
- **`Overrides` replaced with `Record<string, unknown>`**.
- **TypeChain removed** -- contract ABIs are used directly; no generated TypeChain wrappers.
- **`ethers.FetchRequest` replaced with native `fetch()`** for HTTP calls.
- **New provider abstraction types** -- `OpenSeaSigner`, `OpenSeaProvider`, `ContractCaller`, `OpenSeaWallet` are exported for custom provider integrations.
- **`provider` public property removed** -- The `sdk.provider` property (ethers `JsonRpcProvider`) is no longer exposed. If you need direct RPC access, use the provider you passed to the constructor. The SDK's `api` property (`sdk.api`) is still available for API queries.
- **`estimateGas` utility removed** -- This was an ethers-specific utility. Use your provider's native gas estimation instead.
