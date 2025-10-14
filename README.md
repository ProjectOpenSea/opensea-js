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

# OpenSea.js <!-- omit in toc -->

This is the TypeScript SDK for [OpenSea](https://opensea.io), the largest marketplace for NFTs.

It allows developers to access the official orderbook, filter it, create listings and offers, and complete trades programmatically.

Get started by [requesting an API key](https://docs.opensea.io/reference/api-keys) and instantiating your own OpenSea SDK instance. Then you can create orders off-chain or fulfill orders on-chain, and listen to events in the process.

Happy seafaring! ⛵️

## Security Warning

**⚠️ Do not use this SDK directly in client-side/frontend applications.**

The OpenSea SDK requires an API key for initialization. If you embed your API key in frontend code (e.g., browser applications, mobile apps), it will be publicly exposed and could be extracted by anyone, leading to potential abuse and rate limit issues.

### Recommended Architecture

For frontend applications that need to interact with OpenSea functionality:

1. **Create a backend API wrapper**: Set up your own backend server that securely stores your OpenSea API key
2. **Call OpenSea SDK server-side**: Use opensea-js on your backend to interact with OpenSea's APIs
3. **Return data to your frontend**: Send the necessary data (like transaction parameters) back to your frontend
4. **Execute transactions in the browser**: Have users sign transactions with their own wallets (e.g., MetaMask) in the browser

For a detailed example of this architecture, see [this guide on frontend fulfillment architecture](https://gist.github.com/ryanio/52b909dc36e50dd0c03983983ed5839b).

## Documentation

- [Quick Start Guide](developerDocs/quick-start.md)
- [Getting Started Guide](developerDocs/getting-started.md)
- [Advanced Use Cases](developerDocs/advanced-use-cases.md)
- [SDK Reference](https://projectopensea.github.io/opensea-js/)
- [Frequently Asked Questions](developerDocs/faq.md)
- [Contributing](developerDocs/contributing.md)

## Changelog

The changelog for recent versions can be found at:

- opensea-js: https://github.com/ProjectOpenSea/opensea-js/releases
- OpenSea API: https://docs.opensea.io/changelog

[version-badge]: https://img.shields.io/github/package-json/v/ProjectOpenSea/opensea-js
[version-link]: https://github.com/ProjectOpenSea/opensea-js/releases
[npm-badge]: https://img.shields.io/npm/v/opensea-js?color=red
[npm-link]: https://www.npmjs.com/package/opensea-js
[ci-badge]: https://github.com/ProjectOpenSea/opensea-js/actions/workflows/code-quality.yml/badge.svg
[ci-link]: https://github.com/ProjectOpenSea/opensea-js/actions/workflows/code-quality.yml
[coverage-badge]: https://coveralls.io/repos/github/ProjectOpenSea/opensea-js/badge.svg?branch=main
[coverage-link]: https://coveralls.io/github/ProjectOpenSea/opensea-js?branch=main
[license-badge]: https://img.shields.io/github/license/ProjectOpenSea/opensea-js
[license-link]: https://github.com/ProjectOpenSea/opensea-js/blob/main/LICENSE
[docs-badge]: https://img.shields.io/badge/OpenSea.js-documentation-informational
[docs-link]: https://github.com/ProjectOpenSea/opensea-js#documentation
[discussions-badge]: https://img.shields.io/badge/OpenSea.js-discussions-blueviolet
[discussions-link]: https://github.com/ProjectOpenSea/opensea-js/discussions
