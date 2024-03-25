import {
  CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
  CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
} from "@opensea/seaport-js/lib/constants";
import { expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import { isValidProtocol } from "../src/utils/utils";

suite("Utils: utils", () => {
  test("isValidProtocol works with all forms of address", async () => {
    const randomAddress = ethers.Wallet.createRandom().address;

    // Mapping of [address, isValid]
    const addressesToCheck: [string, boolean][] = [
      [CROSS_CHAIN_SEAPORT_V1_5_ADDRESS, true],
      [CROSS_CHAIN_SEAPORT_V1_6_ADDRESS, true],
      [randomAddress, false],
    ];

    // Check default, lowercase, and checksum addresses
    const formatsToCheck = (address: string) => [
      address,
      address.toLowerCase(),
      ethers.getAddress(address),
    ];

    for (const [address, isValid] of addressesToCheck) {
      for (const formattedAddress of formatsToCheck(address)) {
        expect(isValidProtocol(formattedAddress)).to.equal(isValid);
      }
    }
  });
});
