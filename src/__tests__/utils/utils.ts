import {
  CROSS_CHAIN_SEAPORT_V1_4_ADDRESS,
  CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
} from "@opensea/seaport-js/lib/constants";
import { assert } from "chai";
import { suite, test } from "mocha";
import Web3 from "web3";
import { isValidProtocol } from "../../utils/utils";

suite("Utils: utils", () => {
  test("isValidProtocol works with all forms of address", async () => {
    const seaport_v1_5 = CROSS_CHAIN_SEAPORT_V1_5_ADDRESS;
    const seaport_v_1_4 = CROSS_CHAIN_SEAPORT_V1_4_ADDRESS;
    const randomAddress = "0x1F7Cf51573Bf5270323a395F0bb5Fd3c3a4DB867";

    assert.isTrue(isValidProtocol(seaport_v1_5));
    assert.isFalse(isValidProtocol(seaport_v_1_4));
    assert.isFalse(isValidProtocol(randomAddress));

    assert.isTrue(isValidProtocol(seaport_v1_5.toLowerCase()));
    assert.isFalse(isValidProtocol(seaport_v_1_4.toLowerCase()));
    assert.isFalse(isValidProtocol(randomAddress.toLowerCase()));

    assert.isTrue(isValidProtocol(Web3.utils.toChecksumAddress(seaport_v1_5)));
    assert.isFalse(
      isValidProtocol(Web3.utils.toChecksumAddress(seaport_v_1_4))
    );
    assert.isFalse(
      isValidProtocol(Web3.utils.toChecksumAddress(randomAddress))
    );
  });
});
