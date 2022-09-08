import { assert } from "chai";
import { suite, test } from "mocha";
import {
  apiToTest,
  CK_RINKEBY_ADDRESS,
  CK_RINKEBY_SELLER_FEE,
  CK_RINKEBY_TOKEN_ID,
  mainApi,
  rinkebyApi,
  RINKEBY_API_KEY,
} from "../constants";

suite("api", () => {
  test("API has correct base url", () => {
    assert.equal(mainApi.apiBaseUrl, "https://api.opensea.io");
    assert.equal(rinkebyApi.apiBaseUrl, "https://testnets-api.opensea.io");
  });

  test("API fetches bundles and prefetches sell orders", async () => {
    const { bundles } = await apiToTest.getBundles({
      asset_contract_address: CK_RINKEBY_ADDRESS,
    });
    assert.isArray(bundles);

    const bundle = bundles[0];
    assert.isNotNull(bundle);
    if (!bundle) {
      return;
    }
    assert.include(
      bundle.assets.map((a) => a.assetContract.name),
      "CryptoKittiesRinkeby"
    );
  });

  test("Includes API key in token request", async () => {
    const oldLogger = rinkebyApi.logger;

    const logPromise = new Promise<void>((resolve, reject) => {
      rinkebyApi.logger = (log) => {
        try {
          assert.include(log, `"X-API-KEY":"${RINKEBY_API_KEY}"`);
          resolve();
        } catch (e) {
          reject(e);
        } finally {
          rinkebyApi.logger = oldLogger;
        }
      };
      rinkebyApi.getPaymentTokens({ symbol: "WETH" });
    });

    await logPromise;
  });

  test("API fetches tokens", async () => {
    const { tokens } = await apiToTest.getPaymentTokens({ symbol: "MANA" });
    assert.isArray(tokens);
    assert.equal(tokens.length, 1);
    assert.equal(tokens[0].name, "Decentraland MANA");
  });

  test("API fetches fees for an asset", async () => {
    const asset = await apiToTest.getAsset({
      tokenAddress: CK_RINKEBY_ADDRESS,
      tokenId: CK_RINKEBY_TOKEN_ID,
    });
    assert.equal(asset.tokenId, CK_RINKEBY_TOKEN_ID.toString());
    assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby");
    assert.equal(
      asset.assetContract.sellerFeeBasisPoints,
      CK_RINKEBY_SELLER_FEE
    );
  });

  test("API fetches assets", async () => {
    const { assets } = await apiToTest.getAssets({
      asset_contract_address: CK_RINKEBY_ADDRESS,
      order_by: "sale_date",
    });
    assert.isArray(assets);
    assert.equal(assets.length, apiToTest.pageSize);

    const asset = assets[0];
    assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby");
  });

  test("API handles errors", async () => {
    // 401 Unauthorized
    try {
      await apiToTest.get("/user");
    } catch (error) {
      assert.include((error as Error).message, "Unauthorized");
    }

    // 404 Not found
    try {
      await apiToTest.get(`/asset/${CK_RINKEBY_ADDRESS}/0`);
    } catch (error) {
      assert.include((error as Error).message, "Not found");
    }
  });
});
