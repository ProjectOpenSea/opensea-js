---
title: Contributing
category: 64cbb5277b5f3c0065d96616
slug: opensea-sdk-contributions
parentDocSlug: opensea-sdk
order: 5
hidden: false
---

## Development Information

**Setup**

Before any development, install the required NPM dependencies:

```bash
npm install
```

And install TypeScript if you haven't already:

```bash
npm install -g typescript
```

**Build**

Then, lint and build the library into the `lib` directory:

```bash
npm run build
```

Or run the tests:

```bash
npm test
```

Note that the tests require access to Alchemy and the OpenSea API. The timeout is adjustable via the `test` script in `package.json`.

**Testing your branch locally**

```sh
npm link # in opensea-js repo
npm link opensea-js # in repo you're working on
```

**Generate Documentation**

Generate html docs, also available for browsing [here](https://projectopensea.github.io/opensea-js/):

```bash
npm run docs-build
```

**Contributing**

Contributions welcome! Please use GitHub issues for suggestions/concerns - if you prefer to express your intentions in code, feel free to submit a pull request.
