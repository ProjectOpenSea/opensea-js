import { assert } from "chai";
import { suite, test } from "mocha";
import { Chain } from "../../src/types";
import { getSdkForChain } from "../utils/setupIntegration";

suite("SDK: getAccount", () => {
  test("Get Account", async () => {
    const address = "0xfba662e1a8e91a350702cf3b87d0c2d2fb4ba57f";
    const account = await getSdkForChain(Chain.Mainnet).api.getAccount(address);

    assert(account, "Account should not be null");
    assert.equal(account.address, address, "Address should match");
  });
});
