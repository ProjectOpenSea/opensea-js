# Integration Tests

These tests were built to test the order posting functionality of the SDK. Signing and posting order requires a bit more setup than the other tests, so we detail that here.

### Environment variables:

Environment variables for integration tests are set using `.env`. This file is not in the source code for the repository so you will need to create a file with the following fields:

```
API_KEY = "" # OpenSea API Key
WALLET_PRIV_KEY = ""
ALCHEMY_API_KEY = ""
# The following needs to be an NFT owned by the WALLET_ADDRESS
SELL_ORDER_CONTRACT_ADDRESS = "" # If not set, postSellOrder test will fail
SELL_ORDER_TOKEN_ID = "" # If not set, postSellOrder test will fail
```

Optional:

```
OFFER_AMOUNT = "" # Defaults to 0.004
LISTING_AMOUNT = "" # Defaults to 40
```

#### WETH Tests

This test requires ETH and transaction fee to be in your wallet. For this reason, this test is skipped during normal integration
test runs. If you would like to run this test, you need to add `ETH_TO_WRAP = ""` to your `.env` file. If the environment variable
is set, only the eth wrap/unwrap test will be run

### How to run:

```
npm run integration_tests
```