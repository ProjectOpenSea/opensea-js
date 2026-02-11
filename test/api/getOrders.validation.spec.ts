import { expect } from "chai";
import { suite, test } from "mocha";
import { OpenSeaAPI } from "../../src/api/api";
import { Chain, OrderSide } from "../../src/types";

const ETH_PRICE_ERROR =
  'When using orderBy: "eth_price", you must provide both assetContractAddress and tokenIds (or tokenId) parameters';

suite("API: getOrder/getOrders eth_price validation", () => {
  const api = new OpenSeaAPI({ chain: Chain.Mainnet });

  suite("getOrder", () => {
    test("throws when orderBy eth_price without assetContractAddress", async () => {
      try {
        await api.getOrder({
          side: OrderSide.LISTING,
          orderBy: "eth_price",
          tokenIds: ["1"],
        });
        expect.fail("Should have thrown an error");
      } catch (error: unknown) {
        expect((error as Error).message).to.equal(ETH_PRICE_ERROR);
      }
    });

    test("throws when orderBy eth_price without tokenIds or tokenId", async () => {
      try {
        await api.getOrder({
          side: OrderSide.LISTING,
          orderBy: "eth_price",
          assetContractAddress: "0x1234567890123456789012345678901234567890",
        });
        expect.fail("Should have thrown an error");
      } catch (error: unknown) {
        expect((error as Error).message).to.equal(ETH_PRICE_ERROR);
      }
    });

    test("does not throw when orderBy eth_price with tokenIds", async () => {
      // Should pass validation and only fail at the network level
      try {
        await api.getOrder({
          side: OrderSide.LISTING,
          orderBy: "eth_price",
          assetContractAddress: "0x1234567890123456789012345678901234567890",
          tokenIds: ["1"],
        });
      } catch (error: unknown) {
        // Network errors are expected, but validation errors are not
        expect((error as Error).message).to.not.equal(ETH_PRICE_ERROR);
      }
    });

    test("does not throw when orderBy eth_price with tokenId (singular)", async () => {
      try {
        await api.getOrder({
          side: OrderSide.LISTING,
          orderBy: "eth_price",
          assetContractAddress: "0x1234567890123456789012345678901234567890",
          tokenId: "1",
        });
      } catch (error: unknown) {
        expect((error as Error).message).to.not.equal(ETH_PRICE_ERROR);
      }
    });
  });

  suite("getOrders", () => {
    test("throws when orderBy eth_price without assetContractAddress", async () => {
      try {
        await api.getOrders({
          side: OrderSide.LISTING,
          orderBy: "eth_price",
          tokenIds: ["1"],
        });
        expect.fail("Should have thrown an error");
      } catch (error: unknown) {
        expect((error as Error).message).to.equal(ETH_PRICE_ERROR);
      }
    });

    test("throws when orderBy eth_price without tokenIds or tokenId", async () => {
      try {
        await api.getOrders({
          side: OrderSide.LISTING,
          orderBy: "eth_price",
          assetContractAddress: "0x1234567890123456789012345678901234567890",
        });
        expect.fail("Should have thrown an error");
      } catch (error: unknown) {
        expect((error as Error).message).to.equal(ETH_PRICE_ERROR);
      }
    });

    test("does not throw when orderBy eth_price with tokenIds", async () => {
      try {
        await api.getOrders({
          side: OrderSide.LISTING,
          orderBy: "eth_price",
          assetContractAddress: "0x1234567890123456789012345678901234567890",
          tokenIds: ["1"],
        });
      } catch (error: unknown) {
        expect((error as Error).message).to.not.equal(ETH_PRICE_ERROR);
      }
    });

    test("does not throw when orderBy eth_price with tokenId (singular)", async () => {
      try {
        await api.getOrders({
          side: OrderSide.LISTING,
          orderBy: "eth_price",
          assetContractAddress: "0x1234567890123456789012345678901234567890",
          tokenId: "1",
        });
      } catch (error: unknown) {
        expect((error as Error).message).to.not.equal(ETH_PRICE_ERROR);
      }
    });
  });
});
