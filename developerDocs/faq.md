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
- [There is no SDK method for the API request I am trying to call.](#there-is-no-sdk-method-for-the-api-request-i-am-trying-to-call)

## How do I access the source code?

The source code for the SDK can be found on [GitHub](https://github.com/ProjectOpenSea/opensea-js).

## What chains are supported?

See the [Chain enum](https://github.com/ProjectOpenSea/opensea-js/blob/main/src/types.ts#L101) for a complete list of supported chains.

Please note a number of older SDK methods (API v1) only support Ethereum Mainnet and Sepolia due to Rest API restrictions. Please use methods in the v2 API for multichain capabilities.

## Why is there is no SDK method for the API request I am trying to call?

If the SDK does not currently have a specific API, you can use the generic [GET and POST methods](https://github.com/ProjectOpenSea/opensea-js/blob/main/src/api/api.ts#L612-L636) to make any API Request. This repository is also open source, so please feel free to create a pull request.
