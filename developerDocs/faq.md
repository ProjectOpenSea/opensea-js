---
title: Frequenty Asked Questions
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

Source code can be found on [Github](https://github.com/ProjectOpenSea/opensea-js)

## What chains are supported?

See [Chain enum](https://github.com/ProjectOpenSea/opensea-js/blob/main/src/types.ts#L101) for a complete list of supported chains. However, a number
of older methods only support Ethereum Mainnet and Goerli due to Rest API restrictions.

## There is no SDK method for the API request I am trying to call.

If the SDK does not currently have a specific API, you can use the generic [Get and Post methods](https://github.com/ProjectOpenSea/opensea-js/blob/main/src/api/api.ts#L612-L636) to make any API Request. Also, this repo is an Open Source repo so feel free to create a pull request.
