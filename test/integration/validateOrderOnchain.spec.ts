import { OrderComponents } from "@opensea/seaport-js/lib/types";
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
  test("Build listing order components and validate onchain", async function () {
    // Set timeout to 60 seconds for this complex test
    this.timeout(60_000);

    // Skip if Polygon-specific environment variables are not set
    if (!TOKEN_ADDRESS_POLYGON || !TOKEN_ID_POLYGON) {
      console.log(
        "Skipping test - missing Polygon token address or token ID environment variables",
      );
      this.skip();
    }

    // Build listing order components directly without submitting to API
    const asset = {
      tokenAddress: TOKEN_ADDRESS_POLYGON as string,
      tokenId: TOKEN_ID_POLYGON as string,
    };

    const listingParams = {
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset,
      expirationTime: getRandomExpiration(),
      salt: getRandomSalt(),
    };

    // Build the order components directly using private helper method
    const orderComponents = await (
      sdkPolygon as unknown as {
        _buildListingOrderComponents: (
          params: typeof listingParams,
        ) => Promise<OrderComponents>;
      }
    )._buildListingOrderComponents(listingParams);

    console.log("Built listing order components for validation");

    // Validate the order onchain directly
    const txHash = await sdkPolygon.validateOrderOnchain(
      orderComponents,
      walletAddress,
    );

    expect(txHash).to.be.a("string");
    expect(txHash).to.match(/^0x[0-9a-fA-F]{64}$/);
    console.log(`Listing validated onchain with tx hash: ${txHash}`);

    console.log("✓ Listing order components successfully validated onchain");
  });

  test("Build offer order components and validate onchain", async function () {
    // Set timeout to 60 seconds for this complex test
    this.timeout(60_000);

    // Skip if Polygon-specific environment variables are not set
    if (!TOKEN_ADDRESS_POLYGON || !TOKEN_ID_POLYGON) {
      console.log(
        "Skipping test - missing Polygon token address or token ID environment variables",
      );
      this.skip();
    }

    // Build offer order components directly without submitting to API
    const asset = {
      tokenAddress: TOKEN_ADDRESS_POLYGON as string,
      tokenId: TOKEN_ID_POLYGON as string,
    };

    const offerParams = {
      accountAddress: walletAddress,
      startAmount: +OFFER_AMOUNT, // Use the same constant as other tests
      asset,
      expirationTime: getRandomExpiration(),
      salt: getRandomSalt(),
    };

    // Build the offer components directly using private helper method
    const orderComponents = await (
      sdkPolygon as unknown as {
        _buildOfferOrderComponents: (
          params: typeof offerParams,
        ) => Promise<OrderComponents>;
      }
    )._buildOfferOrderComponents(offerParams);

    console.log("Built offer order components for validation");

    // Validate the offer onchain directly
    const txHash = await sdkPolygon.validateOrderOnchain(
      orderComponents,
      walletAddress,
    );

    expect(txHash).to.be.a("string");
    expect(txHash).to.match(/^0x[0-9a-fA-F]{64}$/);
    console.log(`Offer validated onchain with tx hash: ${txHash}`);

    console.log("✓ Offer order components successfully validated onchain");
  });
});
