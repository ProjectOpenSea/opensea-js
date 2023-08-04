---
title: Quick Start Guide
category: 64cbb5277b5f3c0065d96616
slug: opensea-sdk-quick-start
parentDocSlug: opensea-sdk
order: 0
hidden: false
---

# Installation

Switching to Node.js version 16 is required for SDK Version 3.0+ and to make sure common crypto dependencies work. Execute `nvm use`, if you have Node Version Manager.

Then, in your project, run:

```bash
npm install --save opensea-js
# or
yarn add opensea-js
```

# Initialization

To get started, first [request an API key](https://docs.opensea.io/reference/api-keys). Note the terms of use for using API data.

Then, create a new OpenSeaJS client, called an OpenSeaSDK 🚢, using your web3 provider:

```typescript
import { ethers } from "ethers";
import { OpenSeaSDK, Chain } from "opensea-js";

// This example provider won't let you make transactions, only read-only calls:
const provider = new ethers.providers.JsonRpcProvider(
  "https://mainnet.infura.io",
);

const openseaSDK = new OpenSeaSDK(provider, {
  chain: Chain.Mainnet,
  apiKey: YOUR_API_KEY,
});
```

**NOTE:** For testnet, please use `Chain.Goerli` as the `chain`. Rinkeby was deprecated in 2022.

**NOTE:** Using the sample provider above won't let you authorize transactions, which are needed when approving and trading assets and currency. To make transactions, you need a provider with a private key or mnemonic set.

In a browser with web3 or an extension like [MetaMask](https://metamask.io/) or [Coinbase Wallet](https://www.coinbase.com/wallet), you can use `window.ethereum` to access the native provider.
