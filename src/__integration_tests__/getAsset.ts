import { assert } from "chai";
import { suite, test } from "mocha";
import { sdk } from "./init";

suite("SDK: getAsset", () => {
  test("Get Asset", async () => {
    const tokenAddress = "0x059edd72cd353df5106d2b9cc5ab83a52287ac3a"; // Chromie Squiggles
    const assetToGet = {
      tokenAddress,
      tokenId: "1",
    };
    const asset = await sdk.api.getAsset(assetToGet);
    assert(asset, "Asset should not be null");
    assert(
      asset.assetContract.address === tokenAddress,
      "Contract address should match."
    );
    assert(asset.animationUrl, "Animation URL should not be null");
  });
});
