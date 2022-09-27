import { assert } from "chai";
import { before, suite, test } from "mocha";
import Web3 from "web3";
import {
  DEFAULT_BUYER_FEE_BASIS_POINTS,
  DEFAULT_SELLER_FEE_BASIS_POINTS,
  ENJIN_ADDRESS,
  ENJIN_COIN_ADDRESS,
  MAINNET_PROVIDER_URL,
} from "../../constants";
import { OpenSeaSDK } from "../../index";
import { Network, OpenSeaAsset, OrderSide } from "../../types";
import { feesToBasisPoints } from "../../utils/utils";
import {
  CATS_IN_MECHS_ID,
  CK_ADDRESS,
  CK_TOKEN_ID,
  DECENTRALAND_ADDRESS,
  DECENTRALAND_ID,
  MAINNET_API_KEY,
  MYTHEREUM_ADDRESS,
  MYTHEREUM_TOKEN_ID,
  SPIRIT_CLASH_OWNER,
  SPIRIT_CLASH_TOKEN_ID,
} from "../constants";

const provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);

const client = new OpenSeaSDK(
  provider,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`)
);

let asset: OpenSeaAsset;

suite("SDK: fees", () => {
  before(async () => {
    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;
    asset = await client.api.getAsset({ tokenAddress, tokenId });
    assert.isNotNull(asset);
  });

  test("Computes fees correctly for non-zero-fee asset", async () => {
    const bountyPercent = 1.5;
    const extraBountyBasisPoints = bountyPercent * 100;

    const collection = asset.collection;
    const buyerFeeBasisPoints =
      collection.openseaBuyerFeeBasisPoints + collection.devBuyerFeeBasisPoints;
    const openseaSellerFeeBasisPoints = feesToBasisPoints(
      collection.fees?.openseaFees
    );
    const devSellerFeeBasisPoints = feesToBasisPoints(
      collection.fees?.sellerFees
    );
    const sellerFeeBasisPoints =
      openseaSellerFeeBasisPoints + devSellerFeeBasisPoints;

    const buyerFees = await client.computeFees({
      asset,
      extraBountyBasisPoints,
      side: OrderSide.Buy,
    });
    assert.equal(buyerFees.totalBuyerFeeBasisPoints, buyerFeeBasisPoints);
    assert.equal(buyerFees.totalSellerFeeBasisPoints, sellerFeeBasisPoints);
    assert.equal(
      buyerFees.openseaSellerFeeBasisPoints,
      openseaSellerFeeBasisPoints
    );
    assert.equal(buyerFees.devSellerFeeBasisPoints, devSellerFeeBasisPoints);
    assert.equal(
      buyerFees.devBuyerFeeBasisPoints,
      collection.devBuyerFeeBasisPoints
    );
    assert.equal(
      buyerFees.devSellerFeeBasisPoints,
      collection.devSellerFeeBasisPoints
    );
    assert.equal(
      buyerFees.openseaBuyerFeeBasisPoints,
      collection.openseaBuyerFeeBasisPoints
    );
    assert.equal(
      buyerFees.openseaSellerFeeBasisPoints,
      collection.openseaSellerFeeBasisPoints
    );
    assert.equal(buyerFees.sellerBountyBasisPoints, 0);

    const sellerFees = await client.computeFees({
      asset,
      extraBountyBasisPoints,
      side: OrderSide.Sell,
    });
    assert.equal(sellerFees.totalBuyerFeeBasisPoints, buyerFeeBasisPoints);
    assert.equal(sellerFees.totalSellerFeeBasisPoints, sellerFeeBasisPoints);
    assert.equal(
      sellerFees.devBuyerFeeBasisPoints,
      collection.devBuyerFeeBasisPoints
    );
    assert.equal(
      sellerFees.devSellerFeeBasisPoints,
      collection.devSellerFeeBasisPoints
    );
    assert.equal(
      sellerFees.openseaBuyerFeeBasisPoints,
      collection.openseaBuyerFeeBasisPoints
    );
    assert.equal(
      sellerFees.openseaSellerFeeBasisPoints,
      collection.openseaSellerFeeBasisPoints
    );
    assert.equal(sellerFees.sellerBountyBasisPoints, extraBountyBasisPoints);

    const heterogenousBundleSellerFees = await client.computeFees({
      extraBountyBasisPoints,
      side: OrderSide.Sell,
    });
    assert.equal(
      heterogenousBundleSellerFees.totalBuyerFeeBasisPoints,
      DEFAULT_BUYER_FEE_BASIS_POINTS
    );
    assert.equal(
      heterogenousBundleSellerFees.totalSellerFeeBasisPoints,
      DEFAULT_SELLER_FEE_BASIS_POINTS
    );
    assert.equal(heterogenousBundleSellerFees.devBuyerFeeBasisPoints, 0);
    assert.equal(heterogenousBundleSellerFees.devSellerFeeBasisPoints, 0);
    assert.equal(
      heterogenousBundleSellerFees.openseaBuyerFeeBasisPoints,
      DEFAULT_BUYER_FEE_BASIS_POINTS
    );
    assert.equal(
      heterogenousBundleSellerFees.openseaSellerFeeBasisPoints,
      DEFAULT_SELLER_FEE_BASIS_POINTS
    );
    assert.equal(
      heterogenousBundleSellerFees.sellerBountyBasisPoints,
      extraBountyBasisPoints
    );
  });

  test.skip("Computes fees correctly for zero-fee asset", async () => {
    const asset = await client.api.getAsset({
      tokenAddress: DECENTRALAND_ADDRESS,
      tokenId: DECENTRALAND_ID,
    });
    const bountyPercent = 0;

    const buyerFees = await client.computeFees({
      asset,
      extraBountyBasisPoints: bountyPercent * 100,
      side: OrderSide.Buy,
    });
    assert.equal(buyerFees.totalBuyerFeeBasisPoints, 0);
    assert.equal(buyerFees.totalSellerFeeBasisPoints, 0);
    assert.equal(buyerFees.devBuyerFeeBasisPoints, 0);
    assert.equal(buyerFees.devSellerFeeBasisPoints, 0);
    assert.equal(buyerFees.openseaBuyerFeeBasisPoints, 0);
    assert.equal(buyerFees.openseaSellerFeeBasisPoints, 0);
    assert.equal(buyerFees.sellerBountyBasisPoints, 0);

    const sellerFees = await client.computeFees({
      asset,
      extraBountyBasisPoints: bountyPercent * 100,
      side: OrderSide.Sell,
    });
    assert.equal(sellerFees.totalBuyerFeeBasisPoints, 0);
    assert.equal(sellerFees.totalSellerFeeBasisPoints, 0);
    assert.equal(sellerFees.devBuyerFeeBasisPoints, 0);
    assert.equal(sellerFees.devSellerFeeBasisPoints, 0);
    assert.equal(sellerFees.openseaBuyerFeeBasisPoints, 0);
    assert.equal(sellerFees.openseaSellerFeeBasisPoints, 0);
    assert.equal(sellerFees.sellerBountyBasisPoints, bountyPercent * 100);
  });

  test("Errors for computing fees correctly", async () => {
    try {
      await client.computeFees({
        asset,
        extraBountyBasisPoints: 200,
        side: OrderSide.Sell,
      });
      assert.fail();
    } catch (err) {
      const error = err as Error;
      if (
        !error.message.includes("bounty exceeds the maximum") ||
        !error.message.includes("OpenSea will add")
      ) {
        assert.fail(error.message);
      }
    }
  });

  test("Computes per-transfer fees correctly, Enjin and CK", async () => {
    const asset = await client.api.getAsset({
      tokenAddress: ENJIN_ADDRESS,
      tokenId: CATS_IN_MECHS_ID,
    });

    const zeroTransferFeeAsset = await client.api.getAsset({
      tokenAddress: CK_ADDRESS,
      tokenId: CK_TOKEN_ID,
    });

    const sellerFees = await client.computeFees({
      asset,
      side: OrderSide.Sell,
    });

    const sellerZeroFees = await client.computeFees({
      asset: zeroTransferFeeAsset,
      side: OrderSide.Sell,
    });

    assert.equal(sellerZeroFees.transferFee.toString(), "0");
    assert.isNull(sellerZeroFees.transferFeeTokenAddress);

    assert.equal(sellerFees.transferFee.toString(), "1000000000000000000");
    assert.equal(sellerFees.transferFeeTokenAddress, ENJIN_COIN_ADDRESS);
  });

  // NOTE: Enjin platform limitation:
  // the transfer fee isn't showing as whitelisted (skipped) by Enjin's method
  test.skip("Computes whitelisted Enjin per-transfer fees correctly", async () => {
    const whitelistedAsset = await client.api.getAsset({
      tokenAddress: ENJIN_ADDRESS,
      tokenId: SPIRIT_CLASH_TOKEN_ID,
    });

    const sellerZeroFees = await client.computeFees({
      asset: whitelistedAsset,
      side: OrderSide.Sell,
      accountAddress: SPIRIT_CLASH_OWNER,
    });

    assert.equal(sellerZeroFees.transferFee.toString(), "0");
    assert.equal(sellerZeroFees.transferFeeTokenAddress, ENJIN_COIN_ADDRESS);
  });
});
