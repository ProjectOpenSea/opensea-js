---
title: OpenSea SDK
category: 64cbb5277b5f3c0065d96616
slug: opensea-sdk
hidden: false
---

# Overview

This is the TypeScript SDK for [OpenSea](https://opensea.io), the largest marketplace for NFTs.

It allows developers to access the official orderbook, filter it, create offers and listings, and complete trades programmatically.

## Getting Started

Get started by [requesting an API key](https://docs.opensea.io/reference/api-keys) and instantiating your own OpenSea SDK instance. Then you can create orders off-chain or fulfill orders on-chain, and listen to events in the process.

Happy seafaring! ⛵️

## Documentation

- **[Quick Start Guide](quick-start.md)** - Installation and initialization
- **[Getting Started Guide](getting-started.md)** - Learn the basics: fetching NFTs, making offers, creating listings
- **[API Reference](api-reference.md)** - Complete reference for all SDK methods
- **[Advanced Use Cases](advanced-use-cases.md)** - Bulk operations, canceling orders, event listening, and more
- **[SDK Reference](https://projectopensea.github.io/opensea-js/)** - Auto-generated TypeDoc API documentation
- **[FAQ](faq.md)** - Frequently asked questions
- **[Contributing](contributing.md)** - How to contribute to the SDK

## Requirements

- Node.js 20 or higher
- An [OpenSea API key](https://docs.opensea.io/reference/api-keys)
- A web3 provider (ethers.js JsonRpcProvider or Wallet)

## Key Features

- **Create Listings & Offers**: List NFTs for sale or make offers on items
- **Fulfill Orders**: Buy listings or accept offers programmatically
- **Bulk Operations**: Create multiple listings/offers with a single signature
- **Events API**: Query historical sales, transfers, and order events
- **Multi-chain Support**: Ethereum, Polygon, Arbitrum, Base, Optimism, and more
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Event Listeners**: React to transactions and order changes in real-time

## Example Usage

```typescript
import { ethers } from "ethers";
import { OpenSeaSDK, Chain, OrderSide } from "opensea-js";

// Initialize the SDK
const provider = new ethers.JsonRpcProvider(
  "https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY",
);
const sdk = new OpenSeaSDK(provider, {
  chain: Chain.Mainnet,
  apiKey: "your-api-key",
});

// Fetch an NFT
const { nft } = await sdk.api.getNFT(contractAddress, tokenId);

// Create an offer
await sdk.createOffer({
  asset: { tokenAddress, tokenId },
  accountAddress: walletAddress,
  amount: 1.5, // In WETH
});

// Fulfill a listing
const order = await sdk.api.getOrder({
  side: OrderSide.LISTING,
  orderHash: "0x...",
});
await sdk.fulfillOrder({ order, accountAddress: walletAddress });
```

## Security Warning

⚠️ **Do not use this SDK directly in client-side/frontend applications.**

The SDK requires an API key which should never be exposed in frontend code. Instead:

1. Use the SDK on a secure backend server
2. Create API endpoints that wrap SDK functionality
3. Call your backend from the frontend
4. Have users sign transactions with their wallets in the browser

See the [README Security Warning](../README.md#security-warning) for more details.
