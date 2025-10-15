---
title: Quick Start Guide
category: 64cbb5277b5f3c0065d96616
slug: opensea-sdk-quick-start
parentDocSlug: opensea-sdk
order: 0
hidden: false
---

> 📖 **For a complete reference of all SDK methods with detailed parameters and return types, see the [API Reference](api-reference.md).**

# Installation

Node.js version 20 or higher is required for the SDK. If you have Node Version Manager (nvm), run `nvm use 20`.

Then in your project, run:

```bash
npm install --save opensea-js
# or
yarn add opensea-js
```

# Initialization

To get started, first [request an API key](https://docs.opensea.io/reference/api-keys). Note the terms of use for using API data.

Then, create a new OpenSeaSDK client using your web3 provider:

```typescript
import { ethers } from "ethers";
import { OpenSeaSDK, Chain } from "opensea-js";

// This example provider won't let you make transactions, only read-only calls:
const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io");

const openseaSDK = new OpenSeaSDK(provider, {
  chain: Chain.Mainnet,
  apiKey: YOUR_API_KEY,
});
```

## Wallet

Using the example provider above won't let you authorize transactions, which are needed when approving and trading assets and currency. To make transactions, you need a provider with a private key or mnemonic set:

```typescript
const walletWithProvider = new ethers.Wallet(PRIVATE_KEY, provider);

const openseaSDK = new OpenSeaSDK(walletWithProvider, {
  chain: Chain.Mainnet,
  apiKey: YOUR_API_KEY,
});
```

In a browser with web3 or an extension like [MetaMask](https://metamask.io/) or [Coinbase Wallet](https://www.coinbase.com/wallet), you can use `window.ethereum` to access the native provider.

> **⚠️ Security Warning**: While the SDK supports browser-based providers like `window.ethereum`, **you should never include your API key in client-side code**. Exposing your API key in frontend applications allows anyone to extract and abuse it. Instead, use the SDK on a secure backend server and return transaction data to your frontend. See the [README Security Warning](../README.md#security-warning) for the recommended architecture.
