# Integration Tests

These tests were built to test the order posting functionality of the SDK. Signing and posting order requires a bit more setup than the other tests, so we detail that here.

### Environment variables:

Environment variables for integration tests are set using `.env`. This file is not in the source code for the repository so you will need to create a file with the following fields:

```bash
OPENSEA_API_KEY="" # OpenSea API Key
ALCHEMY_API_KEY="" # Alchemy API Key (used for all supported networks)
WALLET_PRIV_KEY="0x" # Wallet private key

# The following needs to be an NFT owned by the wallet address derived from WALLET_PRIV_KEY
## Mainnet
CREATE_LISTING_CHAIN="ethereum"
CREATE_LISTING_CONTRACT_ADDRESS="0x"
CREATE_LISTING_TOKEN_ID="123"
## Second listing input
CREATE_LISTING_2_CHAIN="polygon"
CREATE_LISTING_2_CONTRACT_ADDRESS="0x"
CREATE_LISTING_2_TOKEN_ID="123"

## Listing fulfillment, there should be a listing available on this NFT to purchase
BUY_LISTING_CHAIN="optimism"
BUY_LISTING_CONTRACT_ADDRESS="0x"
BUY_LISTING_TOKEN_ID="1"
```

Optional:

```bash
OFFER_AMOUNT="0.004" # Defaults to 0.004
LISTING_AMOUNT="40" # Defaults to 40
```

#### WETH Tests

This test requires ETH in your wallet and an amount for the transaction fee. Please note THIS TEST COSTS ETH TO RUN.

If you would like to run this test, you need to add `ETH_TO_WRAP = "0.001"` to your `.env` file.

### How to run:

```
npm run test:integration
```
