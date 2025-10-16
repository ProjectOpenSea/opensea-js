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
  CREATE_LISTING_2_CONTRACT_ADDRESS,
  CREATE_LISTING_2_TOKEN_ID,
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
    this.timeout(120000); // 2 minutes timeout for bulk operations
    this.skip(); // Skip: requires WETH balance and specific NFT availability

    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);

    const expirationTime = getRandomExpiration();

    // Create multiple offers on different NFTs
    // NOTE: These NFTs must exist and wallet must have WETH balance
    const offers = [
      {
        asset: {
          tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c", // Cool Cats
          tokenId: "2288",
        },
        amount: +OFFER_AMOUNT,
      },
      {
        asset: {
          tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
          tokenId: "2289",
        },
        amount: +OFFER_AMOUNT,
      },
      {
        asset: {
          tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
          tokenId: "2290",
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
      console.log(
        `Order ${index + 1} signature length:`,
        order.protocolData.signature.length,
      );
      expectValidOrder(order);
      expect(order.expirationTime).to.equal(expirationTime);
      expect(order.maker.address.toLowerCase()).to.equal(
        walletAddress.toLowerCase(),
      );
    });

    // Verify that all orders have unique signatures (bulk signatures include merkle proofs)
    const signatures = result.successful.map((o) => o.protocolData.signature);
    const uniqueSignatures = new Set(signatures);
    expect(uniqueSignatures.size).to.equal(
      signatures.length,
      "Each order should have a unique signature with its merkle proof",
    );

    console.log("✓ All bulk offers created and validated successfully");
  });

  test("Post Bulk Offers with continueOnError - Mainnet", async function () {
    this.timeout(120000);
    this.skip(); // Skip: requires WETH balance and specific NFT availability

    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);

    // Create offers including one that might fail (invalid token ID)
    // NOTE: First NFT must exist, second is intentionally invalid to test error handling
    const offers = [
      {
        asset: {
          tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
          tokenId: "2288",
        },
        amount: +OFFER_AMOUNT,
      },
      {
        asset: {
          tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
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
    this.timeout(120000);

    if (
      !ensureVarsOrSkip(this, {
        CREATE_LISTING_CONTRACT_ADDRESS,
        CREATE_LISTING_TOKEN_ID,
        CREATE_LISTING_2_CONTRACT_ADDRESS,
        CREATE_LISTING_2_TOKEN_ID,
      })
    ) {
      return;
    }

    const chain = CREATE_LISTING_CHAIN;
    const sdk = getSdkForChain(chain);

    const expirationTime = getRandomExpiration();

    // Create multiple listings
    const listings = [
      {
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS,
          tokenId: CREATE_LISTING_TOKEN_ID,
        },
        amount: LISTING_AMOUNT,
      },
    ];

    // Add second listing if available
    if (CREATE_LISTING_2_CONTRACT_ADDRESS && CREATE_LISTING_2_TOKEN_ID) {
      listings.push({
        asset: {
          tokenAddress: CREATE_LISTING_2_CONTRACT_ADDRESS,
          tokenId: CREATE_LISTING_2_TOKEN_ID,
        },
        amount: LISTING_AMOUNT,
      });
    }

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
      console.log(
        `Listing ${index + 1} signature length:`,
        order.protocolData.signature.length,
      );
      expectValidOrder(order);
      expect(order.expirationTime).to.equal(expirationTime);
      expect(order.maker.address.toLowerCase()).to.equal(
        walletAddress.toLowerCase(),
      );
      expect(order.side).to.equal("ask");
    });

    // Verify that all orders have unique signatures (bulk signatures include merkle proofs)
    const signatures = result.successful.map((o) => o.protocolData.signature);
    const uniqueSignatures = new Set(signatures);
    expect(uniqueSignatures.size).to.equal(
      signatures.length,
      "Each order should have a unique signature with its merkle proof",
    );

    console.log("✓ All bulk listings created and validated successfully");
  });

  test("Post Bulk Listings with different prices and parameters", async function () {
    this.timeout(120000);

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
    const expirationTime2 = getRandomExpiration();

    // Create listings with different parameters
    const listings: Array<{
      asset: { tokenAddress: string; tokenId: string };
      amount: string;
      expirationTime?: number;
      includeOptionalCreatorFees?: boolean;
    }> = [
      {
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS,
          tokenId: CREATE_LISTING_TOKEN_ID,
        },
        amount: LISTING_AMOUNT,
        expirationTime,
      },
    ];

    // Add second listing with different parameters if available
    if (CREATE_LISTING_2_CONTRACT_ADDRESS && CREATE_LISTING_2_TOKEN_ID) {
      listings.push({
        asset: {
          tokenAddress: CREATE_LISTING_2_CONTRACT_ADDRESS,
          tokenId: CREATE_LISTING_2_TOKEN_ID,
        },
        amount: String(+LISTING_AMOUNT * 1.5), // Different price
        expirationTime: expirationTime2, // Different expiration
        includeOptionalCreatorFees: true, // Include optional fees
      });
    }

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
        signatureLength: order.protocolData.signature.length,
      });
    });

    console.log(
      "✓ Bulk listings with different parameters created successfully",
    );
  });

  test("Post Single Listing via Bulk API - uses normal signature", async function () {
    this.timeout(60000);

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
    const signatureLength = order.protocolData.signature.length;
    console.log("Single order signature length:", signatureLength);

    // For single orders, the bulk API should use normal signature to save gas
    // So the signature should be approximately 130 characters (0x + 64 bytes = 128 hex chars)
    expect(signatureLength).to.be.lessThan(200);

    console.log(
      "✓ Single listing via bulk API uses optimized normal signature",
    );
  });

  test("Verify bulk signature structure and merkle proofs", async function () {
    this.timeout(120000);
    this.skip(); // Skip: requires WETH balance and triggers API 500 error

    const chain = Chain.Mainnet;
    const sdk = getSdkForChain(chain);

    // Create 3 offers to test power-of-2 padding (will be padded to 4)
    // NOTE: These NFTs must exist and wallet must have WETH balance
    const offers = [
      {
        asset: {
          tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
          tokenId: "2288",
        },
        amount: +OFFER_AMOUNT,
      },
      {
        asset: {
          tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
          tokenId: "2289",
        },
        amount: +OFFER_AMOUNT,
      },
      {
        asset: {
          tokenAddress: "0x1a92f7381b9f03921564a437210bb9396471050c",
          tokenId: "2290",
        },
        amount: +OFFER_AMOUNT,
      },
    ];

    console.log(
      `Creating ${offers.length} offers to verify bulk signature structure...`,
    );
    console.log(`(will be padded to 4 orders for merkle tree)`);

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
      console.log(`  Extracted index: ${extractedIndex} (expected: ${index})`);
      expect(extractedIndex).to.equal(index);
    });

    console.log("\n✓ Bulk signature structure verified successfully");
  });
});
