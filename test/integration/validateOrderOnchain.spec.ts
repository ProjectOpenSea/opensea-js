import { expect } from "chai";
import { suite, test } from "mocha";
import { OFFER_AMOUNT } from "../utils/env";
import { ensureVarsOrSkip, normalizeChainName } from "../utils/runtime";
import {
  LISTING_AMOUNT,
  walletAddress,
  requireIntegrationEnv,
  CREATE_LISTING_2_CONTRACT_ADDRESS,
  CREATE_LISTING_2_TOKEN_ID,
  CREATE_LISTING_2_CHAIN,
  getSdkForChain,
} from "../utils/setupIntegration";
import { getRandomExpiration, getRandomSalt } from "../utils/utils";

// Polygon network integration test for onchain order validation
suite(
  `SDK: validateOrderOnchain - ${normalizeChainName(CREATE_LISTING_2_CHAIN)}`,
  () => {
    beforeEach(() => {
      requireIntegrationEnv();
    });

    test("Create listing and validate onchain", async function () {
      if (
        !ensureVarsOrSkip(this, {
          CREATE_LISTING_2_CONTRACT_ADDRESS,
          CREATE_LISTING_2_TOKEN_ID,
        })
      ) {
        return;
      }

      const chain = CREATE_LISTING_2_CHAIN;
      const sdk = getSdkForChain(chain);

      // Create and validate listing onchain in one call
      const asset = {
        tokenAddress: CREATE_LISTING_2_CONTRACT_ADDRESS as string,
        tokenId: CREATE_LISTING_2_TOKEN_ID as string,
      };
      const txHash = await sdk.createListingAndValidateOnchain({
        accountAddress: walletAddress,
        amount: LISTING_AMOUNT,
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
      if (
        !ensureVarsOrSkip(this, {
          CREATE_LISTING_2_CONTRACT_ADDRESS,
          CREATE_LISTING_2_TOKEN_ID,
        })
      ) {
        return;
      }

      const chain2 = CREATE_LISTING_2_CHAIN;
      const sdk2 = getSdkForChain(chain2);

      // Create and validate offer onchain in one call
      const asset = {
        tokenAddress: CREATE_LISTING_2_CONTRACT_ADDRESS as string,
        tokenId: CREATE_LISTING_2_TOKEN_ID as string,
      };
      const txHash = await sdk2.createOfferAndValidateOnchain({
        accountAddress: walletAddress,
        amount: +OFFER_AMOUNT, // Use the same constant as other tests
        asset,
        expirationTime: getRandomExpiration(),
        salt: getRandomSalt(),
      });

      expect(txHash).to.be.a("string");
      expect(txHash).to.match(/^0x[0-9a-fA-F]{64}$/);
      console.log(
        `Offer created and validated onchain with tx hash: ${txHash}`,
      );

      console.log("✓ Offer successfully created and validated onchain");
    });
  },
);
