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
import { OrderSide } from "../../src/types";
import { OFFER_AMOUNT } from "../utils/constants";

// Polygon network integration test for onchain order validation
suite("SDK: validateOrderOnchain - Polygon Network", () => {
  test("Create listing and validate onchain, then verify in API", async function () {
    // Set timeout to 60 seconds for this complex test
    this.timeout(60_000);

    // Skip if Polygon-specific environment variables are not set
    if (!TOKEN_ADDRESS_POLYGON || !TOKEN_ID_POLYGON) {
      console.log(
        "Skipping test - missing Polygon token address or token ID environment variables",
      );
      this.skip();
    }

    // First create the listing to get the order hash
    const asset = {
      tokenAddress: TOKEN_ADDRESS_POLYGON as string,
      tokenId: TOKEN_ID_POLYGON as string,
    };

    const expirationTime = getRandomExpiration();
    const salt = getRandomSalt();
    const order = await sdkPolygon.createListing({
      accountAddress: walletAddress,
      startAmount: LISTING_AMOUNT,
      asset,
      expirationTime,
      salt,
    });

    expect(order.orderHash).to.be.a("string");
    console.log(`Created listing with order hash: ${order.orderHash}`);

    // Now validate the order onchain using the order components
    const orderComponents = order.protocolData.parameters;
    const txHash = await sdkPolygon.validateOrderOnchain(
      orderComponents,
      walletAddress,
    );

    expect(txHash).to.be.a("string");
    expect(txHash).to.match(/^0x[0-9a-fA-F]{64}$/);
    console.log(`Order validated onchain with tx hash: ${txHash}`);

    // Wait for the transaction to be processed
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Query the API to verify the order exists and can be found by order hash
    let apiOrder;
    let attempts = 0;
    const maxAttempts = 10; // Max 10 attempts over ~10 seconds

    while (attempts < maxAttempts) {
      try {
        const ordersResponse = await sdkPolygon.api.getOrders({
          protocol: "seaport",
          side: OrderSide.LISTING,
          maker: walletAddress,
        });

        if (ordersResponse.orders.length > 0) {
          // Look for our specific order by comparing order hash
          apiOrder = ordersResponse.orders.find(
            (o) => o.orderHash === order.orderHash,
          );
          if (apiOrder) {
            break;
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(`Attempt ${attempts + 1} failed:`, errorMessage);
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(
          `Order not found in API yet, waiting... (attempt ${attempts}/${maxAttempts})`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!apiOrder) {
      throw new Error(
        `Order with hash ${order.orderHash} not found in API after 10 seconds - onchain validation may have failed`,
      );
    }

    // Verify the order exists in the API
    expect(apiOrder).to.exist;
    expect(apiOrder.orderHash).to.equal(order.orderHash);
    expect(apiOrder.protocolAddress).to.equal(order.protocolAddress);

    console.log("✓ Listing successfully validated onchain and found in API");
  });

  test("Create offer and validate onchain, then verify in API", async function () {
    // Set timeout to 60 seconds for this complex test
    this.timeout(60_000);

    // Skip if Polygon-specific environment variables are not set
    if (!TOKEN_ADDRESS_POLYGON || !TOKEN_ID_POLYGON) {
      console.log(
        "Skipping test - missing Polygon token address or token ID environment variables",
      );
      this.skip();
    }

    // First create the offer to get the order hash
    const asset = {
      tokenAddress: TOKEN_ADDRESS_POLYGON as string,
      tokenId: TOKEN_ID_POLYGON as string,
    };

    const expirationTime = getRandomExpiration();
    const salt = getRandomSalt();
    const order = await sdkPolygon.createOffer({
      accountAddress: walletAddress,
      startAmount: +OFFER_AMOUNT, // Use the same constant as other tests
      asset,
      expirationTime,
      salt,
    });

    expect(order.orderHash).to.be.a("string");
    console.log(`Created offer with order hash: ${order.orderHash}`);

    // Now validate the order onchain using the order components
    const orderComponents = order.protocolData.parameters;
    const txHash = await sdkPolygon.validateOrderOnchain(
      orderComponents,
      walletAddress,
    );

    expect(txHash).to.be.a("string");
    expect(txHash).to.match(/^0x[0-9a-fA-F]{64}$/);
    console.log(`Order validated onchain with tx hash: ${txHash}`);

    // Wait for the transaction to be processed
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Query the API to verify the order exists and can be found by order hash
    let apiOrder;
    let attempts = 0;
    const maxAttempts = 10; // Max 10 attempts over ~10 seconds

    while (attempts < maxAttempts) {
      try {
        const ordersResponse = await sdkPolygon.api.getOrders({
          protocol: "seaport",
          side: OrderSide.OFFER,
          maker: walletAddress,
        });

        if (ordersResponse.orders.length > 0) {
          // Look for our specific order by comparing order hash
          apiOrder = ordersResponse.orders.find(
            (o) => o.orderHash === order.orderHash,
          );
          if (apiOrder) {
            break;
          }
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.log(`Attempt ${attempts + 1} failed:`, errorMessage);
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(
          `Order not found in API yet, waiting... (attempt ${attempts}/${maxAttempts})`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!apiOrder) {
      throw new Error(
        `Order with hash ${order.orderHash} not found in API after 10 seconds - onchain validation may have failed`,
      );
    }

    // Verify the order exists in the API
    expect(apiOrder).to.exist;
    expect(apiOrder.orderHash).to.equal(order.orderHash);
    expect(apiOrder.protocolAddress).to.equal(order.protocolAddress);

    console.log("✓ Offer successfully validated onchain and found in API");
  });
});
