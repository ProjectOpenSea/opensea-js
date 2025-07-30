import { expect } from "chai";
import { suite, test } from "mocha";
import {
  LISTING_AMOUNT,
  TOKEN_ADDRESS_POLYGON,
  TOKEN_ID_POLYGON,
  walletAddress,
  getRandomExpiration,
  getRandomSalt,
  sdkPolygon,
} from "./setup";
import { OFFER_AMOUNT } from "../utils/constants";

// Polygon network integration test for onchain order validation
suite("SDK: validateOrderOnchain - Polygon Network", () => {
  test("Create listing and validate onchain", async function () {
    // Set timeout to 60 seconds for this complex test
    this.timeout(60_000);

    // Skip if Polygon-specific environment variables are not set
    if (!TOKEN_ADDRESS_POLYGON || !TOKEN_ID_POLYGON) {
      console.log(
        "Skipping test - missing Polygon token address or token ID environment variables",
      );
      this.skip();
    }

    // Create and validate listing onchain in one call
    const asset = {
      tokenAddress: TOKEN_ADDRESS_POLYGON as string,
      tokenId: TOKEN_ID_POLYGON as string,
    };

    const txHash = await sdkPolygon.createListingAndValidateOnchain({
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset,
      expirationTime: getRandomExpiration(),
      salt: getRandomSalt(),
    });

    expect(txHash).to.be.a("string");
    expect(txHash).to.match(/^0x[0-9a-fA-F]{64}$/);
    console.log(
      `Listing created and validated onchain with tx hash: ${txHash}`,
    );

    console.log("✓ Listing successfully created and validated onchain");
  });

  test("Create offer and validate onchain", async function () {
    // Set timeout to 60 seconds for this complex test
    this.timeout(60_000);

    // Skip if Polygon-specific environment variables are not set
    if (!TOKEN_ADDRESS_POLYGON || !TOKEN_ID_POLYGON) {
      console.log(
        "Skipping test - missing Polygon token address or token ID environment variables",
      );
      this.skip();
    }

    // Create and validate offer onchain in one call
    const asset = {
      tokenAddress: TOKEN_ADDRESS_POLYGON as string,
      tokenId: TOKEN_ID_POLYGON as string,
    };

    const txHash = await sdkPolygon.createOfferAndValidateOnchain({
      accountAddress: walletAddress,
      startAmount: +OFFER_AMOUNT, // Use the same constant as other tests
      asset,
      expirationTime: getRandomExpiration(),
      salt: getRandomSalt(),
    });

    expect(txHash).to.be.a("string");
    expect(txHash).to.match(/^0x[0-9a-fA-F]{64}$/);
    console.log(`Offer created and validated onchain with tx hash: ${txHash}`);

    console.log("✓ Offer successfully created and validated onchain");
  });
});
