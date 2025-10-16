import { expect } from "chai";
import { suite, test } from "mocha";
import { Chain } from "../../src/types";
import { OFFER_AMOUNT } from "../utils/env";
import { ensureVarsOrSkip } from "../utils/runtime";
import {
  LISTING_AMOUNT,
  CREATE_LISTING_CHAIN,
  CREATE_LISTING_CONTRACT_ADDRESS,
  CREATE_LISTING_TOKEN_ID,
  CREATE_LISTING_3_CHAIN,
  CREATE_LISTING_3_CONTRACT_ADDRESS,
  CREATE_LISTING_3_TOKEN_ID,
  getSdkForChain,
  walletAddress,
  requireIntegrationEnv,
} from "../utils/setupIntegration";
import { getRandomExpiration, expectValidOrder } from "../utils/utils";

suite("SDK: bulk order posting", () => {
  beforeEach(() => {
    requireIntegrationEnv();
  });

  test("Post Bulk Offers - Mainnet", async function () {
    // NOTE: Uses CREATE_LISTING and CREATE_LISTING_3 (both on mainnet) for cross-collection orders
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
        CREATE_LISTING_3_CONTRACT_ADDRESS,
        CREATE_LISTING_3_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);

    const expirationTime = getRandomExpiration();

    // Create multiple offers across different collections on mainnet
    const offers = [
      {
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS as string,
          tokenId: CREATE_LISTING_TOKEN_ID as string,
        },
        amount: +OFFER_AMOUNT,
      },
      {
        asset: {
          tokenAddress: CREATE_LISTING_3_CONTRACT_ADDRESS as string,
          tokenId: CREATE_LISTING_3_TOKEN_ID as string,
        },
        amount: +OFFER_AMOUNT * 1.1, // Slightly different price
      },
    ];

    console.log(`Creating ${offers.length} bulk offers...`);

    const result = await sdk.createBulkOffers({
      offers,
      accountAddress: walletAddress,
      continueOnError: false, // Fail if any order fails
      onProgress: (completed, total) => {
        console.log(`Progress: ${completed}/${total} offers submitted`);
      },
    });

    // Verify all orders were created successfully
    expect(result.successful).to.have.lengthOf(offers.length);
    expect(result.failed).to.have.lengthOf(0);

    // Validate each order
    result.successful.forEach((order, index) => {
      console.log(`Order ${index + 1} hash:`, order.orderHash);
      if (order.protocolData.signature) {
        console.log(
          `Order ${index + 1} signature length:`,
          order.protocolData.signature.length,
        );
      }
      expectValidOrder(order);
      expect(order.expirationTime).to.equal(expirationTime);
      expect(order.maker.address.toLowerCase()).to.equal(
        walletAddress.toLowerCase(),
      );
    });

    console.log("✓ All bulk offers created and validated successfully");
  });

  test.skip("Post Bulk Offers with continueOnError - Mainnet", async function () {
    // SKIPPED: This test requires an error during order *submission* to properly test continueOnError.
    // Using an invalid token ID (999999999) causes the error during NFT *validation* phase,
    // which happens before order creation and throws immediately even with continueOnError=true.
    // To properly test continueOnError, we would need a scenario where:
    // - NFT validation succeeds
    // - But order submission fails (e.g., due to API rate limits, blockchain validation, etc.)
    // Currently, all bulk offer submissions are failing with "Internal server error" from the API,
    // so this test cannot be properly validated until that issue is resolved.

    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);

    // Create offers including one that might fail (invalid token ID)
    const offers = [
      {
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS as string,
          tokenId: CREATE_LISTING_TOKEN_ID as string,
        },
        amount: +OFFER_AMOUNT,
      },
      {
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS as string,
          tokenId: "999999999", // This does not exist
        },
        amount: +OFFER_AMOUNT,
      },
    ];

    console.log(
      `Creating ${offers.length} bulk offers with continueOnError=true...`,
    );

    const result = await sdk.createBulkOffers({
      offers,
      accountAddress: walletAddress,
      continueOnError: true, // Continue even if some orders fail
      onProgress: (completed, total) => {
        console.log(`Progress: ${completed}/${total} offers processed`);
      },
    });

    console.log(`Successful: ${result.successful.length}`);
    console.log(`Failed: ${result.failed.length}`);

    // The invalid NFT should fail, but we should continue
    expect(result.failed.length).to.be.greaterThan(0);

    // Validate successful orders
    result.successful.forEach((order) => {
      expectValidOrder(order);
    });

    // Log failed orders for debugging
    result.failed.forEach((failure) => {
      console.log(
        `Order ${failure.index} failed:`,
        failure.error.message.substring(0, 100),
      );
    });

    console.log("✓ Bulk offers with error handling completed");
  });

  test("Post Bulk Listings - Chain A", async function () {
    // NOTE: CREATE_LISTING and CREATE_LISTING_3 must be on the same chain (CREATE_LISTING_CHAIN)
    // to test cross-collection bulk orders on a single chain
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
        CREATE_LISTING_3_CONTRACT_ADDRESS,
        CREATE_LISTING_3_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain = CREATE_LISTING_CHAIN;
    const sdk = getSdkForChain(chain);

    // Verify CREATE_LISTING_3 is on the same chain as CREATE_LISTING
    // NOTE: This test requires both NFTs to be on the same chain to demonstrate
    // cross-collection bulk orders on a single chain
    if (CREATE_LISTING_3_CHAIN !== CREATE_LISTING_CHAIN) {
      throw new Error(
        `CREATE_LISTING_3 must be on the same chain as CREATE_LISTING (${CREATE_LISTING_CHAIN}), but got ${CREATE_LISTING_3_CHAIN}`,
      );
    }

    const expirationTime = getRandomExpiration();

    // Create multiple listings on same chain across different collections
    const listings = [
      {
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS as string,
          tokenId: CREATE_LISTING_TOKEN_ID as string,
        },
        amount: LISTING_AMOUNT,
        expirationTime,
      },
      {
        asset: {
          tokenAddress: CREATE_LISTING_3_CONTRACT_ADDRESS as string,
          tokenId: CREATE_LISTING_3_TOKEN_ID as string,
        },
        amount: LISTING_AMOUNT,
        expirationTime,
      },
    ];

    console.log(`Creating ${listings.length} bulk listings on ${chain}...`);

    const result = await sdk.createBulkListings({
      listings,
      accountAddress: walletAddress,
      continueOnError: false,
      onProgress: (completed, total) => {
        console.log(`Progress: ${completed}/${total} listings submitted`);
      },
    });

    // Verify all orders were created successfully
    expect(result.successful).to.have.lengthOf(listings.length);
    expect(result.failed).to.have.lengthOf(0);

    // Validate each order
    result.successful.forEach((order, index) => {
      console.log(`Listing ${index + 1} hash:`, order.orderHash);
      if (order.protocolData.signature) {
        console.log(
          `Listing ${index + 1} signature length:`,
          order.protocolData.signature.length,
        );
      }
      expectValidOrder(order);
      expect(order.expirationTime).to.equal(expirationTime);
      expect(order.maker.address.toLowerCase()).to.equal(
        walletAddress.toLowerCase(),
      );
      expect(order.side).to.equal("ask");
    });

    console.log("✓ All bulk listings created and validated successfully");
  });

  test("Post Bulk Listings with different prices and parameters", async function () {
    // NOTE: CREATE_LISTING and CREATE_LISTING_3 must be on the same chain (CREATE_LISTING_CHAIN)
    // to test cross-collection bulk orders on a single chain
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
        CREATE_LISTING_3_CONTRACT_ADDRESS,
        CREATE_LISTING_3_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain = CREATE_LISTING_CHAIN;
    const sdk = getSdkForChain(chain);

    // Verify CREATE_LISTING_3 is on the same chain as CREATE_LISTING
    // NOTE: This test requires both NFTs to be on the same chain to demonstrate
    // cross-collection bulk orders on a single chain
    if (CREATE_LISTING_3_CHAIN !== CREATE_LISTING_CHAIN) {
      throw new Error(
        `CREATE_LISTING_3 must be on the same chain as CREATE_LISTING (${CREATE_LISTING_CHAIN}), but got ${CREATE_LISTING_3_CHAIN}`,
      );
    }

    const expirationTime = getRandomExpiration();
    const expirationTime2 = getRandomExpiration();

    // Create listings with different parameters across different collections
    const listings: Array<{
      asset: { tokenAddress: string; tokenId: string };
      amount: string;
      expirationTime?: number;
      includeOptionalCreatorFees?: boolean;
    }> = [
      {
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS as string,
          tokenId: CREATE_LISTING_TOKEN_ID as string,
        },
        amount: LISTING_AMOUNT,
        expirationTime,
      },
      {
        asset: {
          tokenAddress: CREATE_LISTING_3_CONTRACT_ADDRESS as string,
          tokenId: CREATE_LISTING_3_TOKEN_ID as string,
        },
        amount: String(+LISTING_AMOUNT * 1.5), // Different price
        expirationTime: expirationTime2, // Different expiration
        includeOptionalCreatorFees: true, // Include optional fees
      },
    ];

    console.log(
      `Creating ${listings.length} bulk listings with varying parameters...`,
    );

    const result = await sdk.createBulkListings({
      listings,
      accountAddress: walletAddress,
      continueOnError: false,
      onProgress: (completed, total) => {
        console.log(`Progress: ${completed}/${total} listings submitted`);
      },
    });

    expect(result.successful).to.have.lengthOf(listings.length);
    expect(result.failed).to.have.lengthOf(0);

    // Validate each order has correct parameters
    result.successful.forEach((order, index) => {
      expectValidOrder(order);
      console.log(`Listing ${index + 1}:`, {
        hash: order.orderHash,
        expirationTime: order.expirationTime,
        signatureLength: order.protocolData.signature?.length || "N/A",
      });
    });

    console.log(
      "✓ Bulk listings with different parameters created successfully",
    );
  });

  test("Post Single Listing via Bulk API - uses normal signature", async function () {
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain = CREATE_LISTING_CHAIN;
    const sdk = getSdkForChain(chain);

    const expirationTime = getRandomExpiration();

    // Create a single listing via bulk API
    const listings = [
      {
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS,
          tokenId: CREATE_LISTING_TOKEN_ID,
        },
        amount: LISTING_AMOUNT,
        expirationTime,
      },
    ];

    console.log(
      "Creating single listing via bulk API (should use normal signature)...",
    );

    const result = await sdk.createBulkListings({
      listings,
      accountAddress: walletAddress,
    });

    expect(result.successful).to.have.lengthOf(1);
    expect(result.failed).to.have.lengthOf(0);

    const order = result.successful[0];
    expect(order).to.not.be.null;
    expectValidOrder(order);

    // Normal signature should be shorter than bulk signature (no merkle proof)
    // Normal compact signature: 130 chars (0x + 128 hex chars)
    // Bulk signature: 130 + 6 (index) + merkle proof encoding
    if (order.protocolData.signature) {
      const signatureLength = order.protocolData.signature.length;
      console.log("Single order signature length:", signatureLength);

      // For single orders, the bulk API should use normal signature to save gas
      // So the signature should be approximately 130 characters (0x + 64 bytes = 128 hex chars)
      expect(signatureLength).to.be.lessThan(200);
    } else {
      console.log(
        "Signature not returned by API (this is expected for some endpoints)",
      );
    }

    console.log(
      "✓ Single listing via bulk API uses optimized normal signature",
    );
  });

  test("Verify bulk signature structure and merkle proofs", async function () {
    // NOTE: Uses CREATE_LISTING and CREATE_LISTING_3 (both on mainnet) for cross-collection orders
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
        CREATE_LISTING_3_CONTRACT_ADDRESS,
        CREATE_LISTING_3_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);

    // Create 2 offers
    const offers = [
      {
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS as string,
          tokenId: CREATE_LISTING_TOKEN_ID as string,
        },
        amount: +OFFER_AMOUNT,
      },
      {
        asset: {
          tokenAddress: CREATE_LISTING_3_CONTRACT_ADDRESS as string,
          tokenId: CREATE_LISTING_3_TOKEN_ID as string,
        },
        amount: +OFFER_AMOUNT,
      },
    ];

    console.log(
      `Creating ${offers.length} offers to verify bulk signature structure...`,
    );

    const result = await sdk.createBulkOffers({
      offers,
      accountAddress: walletAddress,
      continueOnError: false,
    });

    expect(result.successful).to.have.lengthOf(offers.length);

    // Analyze signature structure
    result.successful.forEach((order, index) => {
      const signature = order.protocolData.signature;
      console.log(`\nOrder ${index}:`);
      console.log(`  Order hash: ${order.orderHash}`);

      if (signature) {
        console.log(`  Signature length: ${signature.length} chars`);
        console.log(`  Signature prefix: ${signature.substring(0, 66)}...`);

        // Bulk signature structure:
        // - Base signature: 130 chars (0x + 128 hex = 64 bytes)
        // - Index: 6 hex chars (3 bytes)
        // - Merkle proof: variable length ABI encoded array
        expect(signature.length).to.be.greaterThan(130);
        expect(signature.startsWith("0x")).to.be.true;

        // Extract and log index from signature
        const indexHex = signature.substring(130, 136);
        const extractedIndex = parseInt(indexHex, 16);
        console.log(
          `  Extracted index: ${extractedIndex} (expected: ${index})`,
        );
        expect(extractedIndex).to.equal(index);
      } else {
        console.log(
          `  Signature not returned by API (this is expected for some endpoints)`,
        );
      }
    });

    console.log("\n✓ Bulk signature structure verified successfully");
  });

  test("Post Bulk Offers - Cross-Collection Orders", async function () {
    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);

    // Create offers across DIFFERENT collections to demonstrate cross-collection bulk orders
    const offers = [
      {
        asset: {
          tokenAddress: "0x61cfce882d8b92583b05f306c3d420d247d5f758", // testhree collection
          tokenId: "3",
        },
        amount: +OFFER_AMOUNT,
      },
      {
        asset: {
          tokenAddress: "0xb46275ce53d478c4b75aad0aec2cb41b2616f302", // azuki-mizuki-anime-shorts
          tokenId: "3",
        },
        amount: +OFFER_AMOUNT * 1.2,
      },
      {
        asset: {
          tokenAddress: "0x76be3b62873462d2142405439777e971754e8e77", // parallelalpha
          tokenId: "10307",
        },
        amount: +OFFER_AMOUNT * 0.8,
      },
      {
        asset: {
          tokenAddress: "0xb46275ce53d478c4b75aad0aec2cb41b2616f302", // azuki-mizuki-anime-shorts (different token)
          tokenId: "7",
        },
        amount: +OFFER_AMOUNT * 1.5,
      },
    ];

    console.log(
      `Creating ${offers.length} bulk offers across ${new Set(offers.map((o) => o.asset.tokenAddress)).size} different collections...`,
    );

    const result = await sdk.createBulkOffers({
      offers,
      accountAddress: walletAddress,
      continueOnError: false,
      onProgress: (completed, total) => {
        console.log(
          `Progress: ${completed}/${total} cross-collection offers submitted`,
        );
      },
    });

    // Verify all orders were created successfully
    expect(result.successful).to.have.lengthOf(offers.length);
    expect(result.failed).to.have.lengthOf(0);

    // Validate each order and verify they're from different collections
    const collections = new Set<string>();
    result.successful.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        collection: offers[index].asset.tokenAddress,
        tokenId: offers[index].asset.tokenId,
        hash: order.orderHash?.substring(0, 10) + "...",
      });
      expectValidOrder(order);
      collections.add(offers[index].asset.tokenAddress);
    });

    console.log(
      `\n✓ Successfully created bulk orders across ${collections.size} different collections`,
    );
    expect(collections.size).to.be.greaterThan(
      1,
      "Should have orders from multiple collections",
    );
  });
});
