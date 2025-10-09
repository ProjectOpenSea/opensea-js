import { expect } from "chai";
import { suite, test } from "mocha";
import { Chain } from "../../src/types";
import { getFeeRecipient } from "../../src/utils/utils";
import { ensureVarsOrSkip, normalizeChainName } from "../utils/runtime";
import {
  LISTING_AMOUNT,
  CREATE_LISTING_CHAIN,
  CREATE_LISTING_CONTRACT_ADDRESS,
  CREATE_LISTING_TOKEN_ID,
  getSdkForChain,
  walletAddress,
  requireIntegrationEnv,
} from "../utils/setupIntegration";
import { getRandomExpiration, expectValidOrder } from "../utils/utils";

suite(
  `SDK: Private Listings Integration - ${normalizeChainName(CREATE_LISTING_CHAIN)}`,
  () => {
    beforeEach(() => {
      requireIntegrationEnv();
    });

    test("Post Private Listing - Mainnet", async function () {
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

      const buyerAddress = "0x0000000000000000000000000000000000000001";
      const expirationTime = getRandomExpiration();

      const privateListing = {
        accountAddress: walletAddress,
        startAmount: LISTING_AMOUNT,
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS,
          tokenId: CREATE_LISTING_TOKEN_ID,
        },
        buyerAddress,
        expirationTime,
      };
      const order = await sdk.createListing(privateListing);
      expectValidOrder(order);

      expect(order.protocolData.parameters.consideration).to.exist;

      const hasMarketplaceFee =
        order.protocolData.parameters.consideration.some(
          (item: { recipient?: string }) =>
            item.recipient?.toLowerCase() ===
            getFeeRecipient(Chain.Mainnet).toLowerCase(),
        );

      expect(hasMarketplaceFee).to.be.false;
    });

    test("Post Regular Listing - Mainnet (for comparison)", async function () {
      if (
        !ensureVarsOrSkip(this, {
          CREATE_LISTING_CONTRACT_ADDRESS,
          CREATE_LISTING_TOKEN_ID,
        })
      ) {
        return;
      }

      const chain2 = CREATE_LISTING_CHAIN;
      const sdk2 = getSdkForChain(chain2);

      const expirationTime = getRandomExpiration();
      const regularListing = {
        accountAddress: walletAddress,
        startAmount: LISTING_AMOUNT,
        asset: {
          tokenAddress: CREATE_LISTING_CONTRACT_ADDRESS,
          tokenId: CREATE_LISTING_TOKEN_ID,
        },
        expirationTime,
      };
      const order = await sdk2.createListing(regularListing);
      expectValidOrder(order);

      expect(order.protocolData.parameters.consideration).to.exist;
      expect(
        order.protocolData.parameters.consideration.length,
      ).to.be.greaterThan(0);
    });
  },
);
