<p align="center">
  <img src="./img/banner.png" />
</p>

[![Version][version-badge]][version-link]
[![npm][npm-badge]][npm-link]
[![Test CI][ci-badge]][ci-link]
[![Coverage Status][coverage-badge]][coverage-link]
[![License][license-badge]][license-link]
[![Docs][docs-badge]][docs-link]
[![Discussions][discussions-badge]][discussions-link]

# @opensea/sdk <!-- omit in toc -->

This is the TypeScript SDK for [OpenSea](https://opensea.io), the largest marketplace for NFTs and tokens.

It allows developers to access the official orderbook, filter it, create listings and offers, complete trades programmatically, and swap tokens across chains.

Get started by getting an API key and instantiating your own OpenSea SDK instance. Then you can create orders off-chain or fulfill orders onchain, and listen to events in the process.

### Get an API key

**For quick experimentation** — request a free-tier key in code, no signup needed. The returned key is valid for 30 days and the endpoint is rate-limited to 3 keys per hour per IP:

```typescript
import { OpenSeaSDK } from "@opensea/sdk";

const { api_key } = await OpenSeaSDK.requestInstantApiKey();
const sdk = new OpenSeaSDK(provider, { chain: Chain.Mainnet, apiKey: api_key });
```

Or from the shell:

```bash
curl -s -X POST https://api.opensea.io/api/v2/auth/keys | jq -r '.api_key'
```

**For production** — create a permanent key at [opensea.io/settings/developer](https://opensea.io/settings/developer). These keys don't expire, get higher rate limits, and can be rotated from your account. See the [API key docs](https://docs.opensea.io/reference/api-keys) for details.

Happy seafaring!

## Quick Start

### With ethers.js

```typescript
import { ethers } from "ethers";
import { OpenSeaSDK, Chain } from "@opensea/sdk";

const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY");
const sdk = new OpenSeaSDK(provider, { chain: Chain.Mainnet, apiKey: "YOUR_API_KEY" });
```

### With viem

```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import { OpenSeaSDK, Chain } from '@opensea/sdk/viem'

const publicClient = createPublicClient({ chain: mainnet, transport: http() })
const sdk = new OpenSeaSDK({ publicClient }, { chain: Chain.Mainnet, apiKey: 'YOUR_API_KEY' })
```

## Documentation

- [Quick Start Guide](developerDocs/quick-start.md)
- [Getting Started Guide](developerDocs/getting-started.md)
- [API Reference](developerDocs/api-reference.md)
- [Advanced Use Cases](developerDocs/advanced-use-cases.md)
- [SDK Reference](https://projectopensea.github.io/opensea-js/)
- [Frequently Asked Questions](developerDocs/faq.md)
- [Contributing](CONTRIBUTING.md)

### Security Warning

**Do not use this SDK directly in client-side/frontend applications.**

The OpenSea SDK requires an API key for initialization. If you embed your API key in frontend code (e.g., browser applications, mobile apps), it will be publicly exposed and could be extracted by anyone, leading to potential abuse and rate limit issues.

#### Recommended Architecture

For frontend applications that need to interact with OpenSea functionality:

1. **Create a backend API wrapper**: Set up your own backend server that securely stores your OpenSea API key
2. **Call OpenSea SDK server-side**: Use `@opensea/sdk` on your backend to interact with OpenSea's APIs
3. **Return data to your frontend**: Send the necessary data (like transaction parameters) back to your frontend
4. **Execute transactions in the browser**: Have users sign transactions with their own wallets (e.g., MetaMask) in the browser

## Changelog

The changelog for recent versions can be found at:

- @opensea/sdk: https://github.com/ProjectOpenSea/opensea-js/releases
- OpenSea API: https://docs.opensea.io/changelog

[version-badge]: https://img.shields.io/github/package-json/v/ProjectOpenSea/opensea-js
[version-link]: https://github.com/ProjectOpenSea/opensea-js/releases
[npm-badge]: https://img.shields.io/npm/v/@opensea/sdk?color=red
[npm-link]: https://www.npmjs.com/package/@opensea/sdk
[ci-badge]: https://github.com/ProjectOpenSea/opensea-js/actions/workflows/ci.yml/badge.svg
[ci-link]: https://github.com/ProjectOpenSea/opensea-js/actions/workflows/ci.yml
[coverage-badge]: https://coveralls.io/repos/github/ProjectOpenSea/opensea-js/badge.svg?branch=main
[coverage-link]: https://coveralls.io/github/ProjectOpenSea/opensea-js?branch=main
[license-badge]: https://img.shields.io/github/license/ProjectOpenSea/opensea-js
[license-link]: https://github.com/ProjectOpenSea/opensea-js/blob/main/LICENSE
[docs-badge]: https://img.shields.io/badge/@opensea/sdk-documentation-informational
[docs-link]: https://github.com/ProjectOpenSea/opensea-js#documentation
[discussions-badge]: https://img.shields.io/badge/@opensea/sdk-discussions-blueviolet
[discussions-link]: https://github.com/ProjectOpenSea/opensea-js/discussions
