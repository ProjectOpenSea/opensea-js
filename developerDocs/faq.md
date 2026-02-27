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

## How do I access the source code?

The source code for the SDK can be found on [GitHub](https://github.com/ProjectOpenSea/opensea-js).

## What chains are supported?

See the `Chain` enum in [`src/types.ts`](https://github.com/ProjectOpenSea/opensea-js/blob/main/src/types.ts) for a complete list of supported chains.

Please use methods in the v2 API for multichain capabilities.

## Why is there no SDK method for the API request I am trying to call?

First, check the [API Reference](api-reference.md) to see all available SDK methods - many OpenSea API v2 endpoints are now supported.

If the SDK does not currently have a specific API, you can use the generic `get` and `post` methods on the `OpenSeaAPI` class in [`src/api/api.ts`](https://github.com/ProjectOpenSea/opensea-js/blob/main/src/api/api.ts) to make any API request. This repository is also open source, so please feel free to create a pull request.
