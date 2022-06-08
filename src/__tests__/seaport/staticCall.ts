import { assert } from "chai";
import { suite, test } from "mocha";
import Web3 from "web3";
import {
  MAINNET_PROVIDER_URL,
  NULL_ADDRESS,
  RINKEBY_PROVIDER_URL,
  STATIC_CALL_TX_ORIGIN_ADDRESS,
} from "../../constants";
import { getMethod, StaticCheckTxOrigin } from "../../contracts";
import { OpenSeaSDK } from "../../index";
import { Network } from "../../types";
import { encodeCall } from "../../utils/schema";
import {
  ALEX_ADDRESS,
  MYTHEREUM_TOKEN_ID,
  MYTHEREUM_ADDRESS,
  ALEX_ADDRESS_2,
  MAINNET_API_KEY,
  RINKEBY_API_KEY,
} from "../constants";
import { testFeesMakerOrder } from "./fees";
import { testMatchingNewOrder } from "./orders";

const provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);
const rinkebyProvider = new Web3.providers.HttpProvider(RINKEBY_PROVIDER_URL);

const client = new OpenSeaSDK(
  provider,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`)
);

const rinkebyClient = new OpenSeaSDK(
  rinkebyProvider,
  {
    networkName: Network.Rinkeby,
    apiKey: RINKEBY_API_KEY,
  },
  (line) => console.info(`RINKEBY: ${line}`)
);

suite("SDK: static calls", () => {
  test("Mainnet staticCall tx.origin can be applied to arbitrary order", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS_2;
    const amountInToken = 2;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
      buyerAddress: NULL_ADDRESS,
      quantity: 1,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
    });

    order.staticTarget = STATIC_CALL_TX_ORIGIN_ADDRESS;
    order.staticExtradata = encodeCall(
      getMethod(
        StaticCheckTxOrigin,
        "succeedIfTxOriginMatchesSpecifiedAddress"
      ),
      [takerAddress]
    );

    assert.equal(order.paymentToken, NULL_ADDRESS);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test.skip("Mainnet StaticCall Decentraland", async () => {
    // Mainnet Decentraland
    const accountAddress = "0xf293dfe0ac79c2536b9426957ac8898d6c743717"; // Mainnet Decentraland Estate owner
    const takerAddress = ALEX_ADDRESS_2;
    const amountInToken = 2;

    const tokenId = "2898"; // Mainnet DecentralandEstate TokenID
    const tokenAddress = "0x959e104e1a4db6317fa58f8295f586e1a978c297"; // Mainnet DecentralandEstates Contract

    const asset = await client.api.getAsset({ tokenAddress, tokenId });

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
      buyerAddress: NULL_ADDRESS,
      quantity: 1,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
    });

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
    assert.equal(order.extra.toNumber(), 0);
    assert.equal(order.expirationTime.toNumber(), 0);
    testFeesMakerOrder(order, asset.collection, 0);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test.skip("Testnet StaticCall CheezeWizards", async () => {
    // Testnet Cheezewizards
    const accountAddress = ALEX_ADDRESS; // Testnet CheezeWizards token owner
    const takerAddress = ALEX_ADDRESS_2;
    const amountInToken = 2;

    // Testnet Cheezewizards
    const tokenId = "3"; // Testnet CheezeWizards TokenID
    const tokenAddress = "0x095731b672b76b00A0b5cb9D8258CD3F6E976cB2"; // Testnet CheezeWizards Guild address

    const asset = await rinkebyClient.api.getAsset({ tokenAddress, tokenId });

    const order = await rinkebyClient._makeSellOrder({
      asset: { tokenAddress, tokenId },
      accountAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
      buyerAddress: NULL_ADDRESS,
      quantity: 1,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
    });

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
    assert.equal(order.extra.toNumber(), 0);
    assert.equal(order.expirationTime.toNumber(), 0);
    testFeesMakerOrder(order, asset.collection, 0);

    await rinkebyClient._sellOrderValidationAndApprovals({
      order,
      accountAddress,
    });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });
});
