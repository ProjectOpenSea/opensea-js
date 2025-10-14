import { expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import { BAYC_CONTRACT_ADDRESS } from "../utils/constants";
import { sdk } from "../utils/sdk";

suite("SDK: bulkTransfer", () => {
  const wallet = ethers.Wallet.createRandom();
  const accountAddress = wallet.address;
  const recipientAddress = ethers.Wallet.createRandom().address;

  test("Should throw an error when using bulkTransfer without wallet", async () => {
    const expectedErrorMessage = `Specified accountAddress is not available through wallet or provider: ${accountAddress}`;

    try {
      await sdk.bulkTransfer({
        assets: [
          {
            asset: {
              tokenAddress: BAYC_CONTRACT_ADDRESS,
              tokenId: "1",
              tokenStandard: "erc721",
            },
            toAddress: recipientAddress,
          },
        ],
        fromAddress: accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }
  });

  test("Should throw an error when assets array is empty", async () => {
    try {
      await sdk.bulkTransfer({
        assets: [],
        fromAddress: accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("At least one asset must be provided");
    }
  });

  test("Should throw an error when ERC20 amount is missing", async () => {
    try {
      await sdk.bulkTransfer({
        assets: [
          {
            asset: {
              tokenAddress: "0x0f5d2fb29fb7d3cfee444a200298f468908cc942", // MANA
              tokenStandard: "erc20",
            },
            toAddress: recipientAddress,
          },
        ],
        fromAddress: accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("Missing ERC20 amount for bulk transfer");
    }
  });

  test("Should throw an error when ERC721 tokenId is missing", async () => {
    try {
      await sdk.bulkTransfer({
        assets: [
          {
            asset: {
              tokenAddress: BAYC_CONTRACT_ADDRESS,
              tokenStandard: "erc721",
            },
            toAddress: recipientAddress,
          },
        ],
        fromAddress: accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include("Missing ERC721 tokenId for bulk transfer");
    }
  });

  test("Should throw an error when ERC1155 tokenId is missing", async () => {
    try {
      await sdk.bulkTransfer({
        assets: [
          {
            asset: {
              tokenAddress: "0x495f947276749ce646f68ac8c248420045cb7b5e",
              tokenStandard: "erc1155",
            },
            toAddress: recipientAddress,
            amount: "1",
          },
        ],
        fromAddress: accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(
        "Missing ERC1155 tokenId for bulk transfer",
      );
    }
  });

  test("Should throw an error when ERC1155 amount is missing", async () => {
    try {
      await sdk.bulkTransfer({
        assets: [
          {
            asset: {
              tokenAddress: "0x495f947276749ce646f68ac8c248420045cb7b5e",
              tokenId: "1",
              tokenStandard: "erc1155",
            },
            toAddress: recipientAddress,
          },
        ],
        fromAddress: accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(
        "Missing ERC1155 amount for bulk transfer",
      );
    }
  });

  test("Should provide helpful error when assets are not approved", async () => {
    // This test will fail on approval check since we're using a random wallet
    // that won't have any assets or approvals
    try {
      await sdk.bulkTransfer({
        assets: [
          {
            asset: {
              tokenAddress: BAYC_CONTRACT_ADDRESS,
              tokenId: "1",
              tokenStandard: "erc721",
            },
            toAddress: recipientAddress,
          },
        ],
        fromAddress: accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      // Should fail on either account check or approval check
      // Both are expected since we're using random wallets
      expect(e.message).to.satisfy((msg: string) =>
        msg.includes("accountAddress is not available") ||
        msg.includes("not approved for transfer"),
      );
    }
  });
});

suite("SDK: batchApproveAssets", () => {
  const wallet = ethers.Wallet.createRandom();
  const accountAddress = wallet.address;

  test("Should throw an error when using batchApproveAssets without wallet", async () => {
    const expectedErrorMessage = `Specified accountAddress is not available through wallet or provider: ${accountAddress}`;

    try {
      await sdk.batchApproveAssets({
        assets: [
          {
            asset: {
              tokenAddress: BAYC_CONTRACT_ADDRESS,
              tokenId: "1",
              tokenStandard: "erc721",
            },
          },
        ],
        fromAddress: accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.include(expectedErrorMessage);
    }
  });

  test("Should return undefined when assets array is empty", async () => {
    const result = await sdk.batchApproveAssets({
      assets: [],
      fromAddress: accountAddress,
    });
    expect(result).to.be.undefined;
  });

  test("Should throw an error when ERC20 amount is missing", async () => {
    try {
      await sdk.batchApproveAssets({
        assets: [
          {
            asset: {
              tokenAddress: "0x0f5d2fb29fb7d3cfee444a200298f468908cc942", // MANA
              tokenStandard: "erc20",
            },
          },
        ],
        fromAddress: accountAddress,
      });
      throw new Error("should have thrown");
    } catch (e: any) {
      expect(e.message).to.satisfy((msg: string) =>
        msg.includes("accountAddress is not available") ||
        msg.includes("Amount required for ERC20 approval"),
      );
    }
  });
});
