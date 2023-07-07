import { assert } from "chai";
import { before, suite, test } from "mocha";
import { OpenSeaSDK } from "../../src/index";
import { Chain, OpenSeaAsset, OrderSide } from "../../src/types";
import { feesToBasisPoints } from "../../src/utils/utils";
import {
  BAYC_CONTRACT_ADDRESS,
  BAYC_TOKEN_ID,
  MAINNET_API_KEY,
  RPC_PROVIDER_MAINNET,
} from "../utils/constants";

const client = new OpenSeaSDK(
  RPC_PROVIDER_MAINNET,
  {
    chain: Chain.Mainnet,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`),
);

let asset: OpenSeaAsset;

suite("SDK: fees", () => {
  before(async () => {
    const tokenId = BAYC_TOKEN_ID;
    const tokenAddress = BAYC_CONTRACT_ADDRESS;
    asset = await client.api.getAsset({ tokenAddress, tokenId });
    assert.isNotNull(asset);
  });

  test("Computes fees correctly for non-zero-fee asset", async () => {
    const collection = asset.collection;
    const buyerFeeBasisPoints =
      collection.openseaBuyerFeeBasisPoints + collection.devBuyerFeeBasisPoints;
    const openseaSellerFeeBasisPoints = feesToBasisPoints(
      collection.fees?.openseaFees,
    );
    const devSellerFeeBasisPoints = feesToBasisPoints(
      collection.fees?.sellerFees,
    );
    const sellerFeeBasisPoints =
      openseaSellerFeeBasisPoints + devSellerFeeBasisPoints;

    const buyerFees = await client.computeFees({
      asset,
      side: OrderSide.Buy,
    });

    assert.equal(buyerFees.totalBuyerFeeBasisPoints, buyerFeeBasisPoints);
    assert.equal(buyerFees.totalSellerFeeBasisPoints, sellerFeeBasisPoints);
    assert.equal(
      buyerFees.openseaSellerFeeBasisPoints,
      openseaSellerFeeBasisPoints,
    );
    assert.equal(buyerFees.devSellerFeeBasisPoints, devSellerFeeBasisPoints);
    assert.equal(
      buyerFees.devBuyerFeeBasisPoints,
      collection.devBuyerFeeBasisPoints,
    );
    assert.equal(
      buyerFees.devSellerFeeBasisPoints,
      collection.devSellerFeeBasisPoints,
    );
    assert.equal(
      buyerFees.openseaBuyerFeeBasisPoints,
      collection.openseaBuyerFeeBasisPoints,
    );
    assert.equal(
      buyerFees.openseaSellerFeeBasisPoints,
      collection.openseaSellerFeeBasisPoints,
    );

    const sellerFees = await client.computeFees({
      asset,
      side: OrderSide.Sell,
    });
    assert.equal(sellerFees.totalBuyerFeeBasisPoints, buyerFeeBasisPoints);
    assert.equal(sellerFees.totalSellerFeeBasisPoints, sellerFeeBasisPoints);
    assert.equal(
      sellerFees.devBuyerFeeBasisPoints,
      collection.devBuyerFeeBasisPoints,
    );
    assert.equal(
      sellerFees.devSellerFeeBasisPoints,
      collection.devSellerFeeBasisPoints,
    );
    assert.equal(
      sellerFees.openseaBuyerFeeBasisPoints,
      collection.openseaBuyerFeeBasisPoints,
    );
    assert.equal(
      sellerFees.openseaSellerFeeBasisPoints,
      collection.openseaSellerFeeBasisPoints,
    );
  });
});
