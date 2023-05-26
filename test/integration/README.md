# Integration Tests

These tests were built to test the order posting functionality of the SDK. Signing and posting order requires a bit more setup than the other tests, so we detail that here.

### Environment variables:

Environment variables for integration tests are set using `.env`. This file is not in the source code for the repository so you will need to create a file with the following fields:

```bash
API_KEY = "" # OpenSea API Key
ALCHEMY_API_KEY = "" # Alchemy API Key
WALLET_PRIV_KEY = "0x" # Wallet private key

# The following needs to be an NFT owned by the wallet address derived from WALLET_PRIV_KEY
SELL_ORDER_CONTRACT_ADDRESS = "0x"
SELL_ORDER_TOKEN_ID = ""
```

Optional:

```bash
OFFER_AMOUNT = "" # Defaults to 0.004
LISTING_AMOUNT = "" # Defaults to 40
```

#### WETH Tests

This test requires ETH and a transaction fee to be in your wallet.

If you would like to run this test, you need to add `ETH_TO_WRAP = "0.001"` to your `.env` file.

### How to run:

```
npm run test:integration
```
