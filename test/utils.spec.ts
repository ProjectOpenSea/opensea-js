import { CROSS_CHAIN_SEAPORT_V1_5_ADDRESS } from "@opensea/seaport-js/lib/constants";
import { assert } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import { isValidProtocol } from "../src/utils/utils";

suite("Utils: utils", () => {
  test("isValidProtocol works with all forms of address", async () => {
    const seaport_v1_5 = CROSS_CHAIN_SEAPORT_V1_5_ADDRESS;
    const randomAddress = "0x1F7Cf51573Bf5270323a395F0bb5Fd3c3a4DB867";

    assert.isTrue(isValidProtocol(seaport_v1_5));
    assert.isFalse(isValidProtocol(randomAddress));

    assert.isTrue(isValidProtocol(seaport_v1_5.toLowerCase()));
    assert.isFalse(isValidProtocol(randomAddress.toLowerCase()));

    assert.isTrue(isValidProtocol(ethers.getAddress(seaport_v1_5)));
    assert.isFalse(isValidProtocol(ethers.getAddress(randomAddress)));
  });
});
