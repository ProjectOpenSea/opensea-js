# Integration Tests

These tests were built to test the order posting functionality of the SDK. Signing and posting order requires a bit more setup than the other tests, so we detail that here.

### Environment variables:

- `API_KEY`: your OpenSea mainnet API key.
- `WALLET_ADDRESS`: the wallet address to send your offer from.
- `WALLET_PRIV_KEY`: the private key to your wallet. This is required to sign the order.
- `ALCHEMY_API_KEY`: your Alchemy API key.

### How to run:

```
API_KEY="..." WALLET_ADDRESS="..." WALLET_PRIV_KEY="..." ALCHEMY_API_KEY="..." npm run integration_tests
```
