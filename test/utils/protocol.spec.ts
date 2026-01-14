import { Seaport } from "@opensea/seaport-js";
import {
  CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
  CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
  ItemType,
} from "@opensea/seaport-js/lib/constants";
import { expect } from "chai";
import { ethers } from "ethers";
import { suite, test } from "mocha";
import {
  SHARED_STOREFRONT_ADDRESSES,
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
  ALTERNATE_SEAPORT_V1_6_ADDRESS,
} from "../../src/constants";
import { TokenStandard } from "../../src/types";
import {
  isValidProtocol,
  requireValidProtocol,
  getAssetItemType,
  remapSharedStorefrontAddress,
  decodeTokenIds,
  getSeaportInstance,
  getSeaportVersion,
} from "../../src/utils/protocol";

suite("Utils: protocol", () => {
  suite("isValidProtocol", () => {
    test("returns true for Seaport 1.6", () => {
      expect(isValidProtocol(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS)).to.be.true;
    });

    test("returns true for alternate Seaport 1.6", () => {
      expect(isValidProtocol(ALTERNATE_SEAPORT_V1_6_ADDRESS)).to.be.true;
    });

    test("returns false for Seaport 1.5 (no longer supported)", () => {
      expect(isValidProtocol(CROSS_CHAIN_SEAPORT_V1_5_ADDRESS)).to.be.false;
    });

    test("returns false for random address", () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(isValidProtocol(randomAddress)).to.be.false;
    });

    test("works with all forms of address (lowercase, checksum)", () => {
      const randomAddress = ethers.Wallet.createRandom().address;

      // Mapping of [address, isValid]
      const addressesToCheck: [string, boolean][] = [
        [CROSS_CHAIN_SEAPORT_V1_6_ADDRESS, true],
        [ALTERNATE_SEAPORT_V1_6_ADDRESS, true],
        [CROSS_CHAIN_SEAPORT_V1_5_ADDRESS, false],
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

  suite("requireValidProtocol", () => {
    test("does not throw for valid protocol", () => {
      expect(() =>
        requireValidProtocol(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS),
      ).to.not.throw();
    });

    test("throws for invalid protocol", () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(() => requireValidProtocol(randomAddress)).to.throw(
        `Unsupported protocol address: ${randomAddress}`,
      );
    });

    test("throws for Seaport 1.5", () => {
      expect(() =>
        requireValidProtocol(CROSS_CHAIN_SEAPORT_V1_5_ADDRESS),
      ).to.throw("Unsupported protocol address");
    });
  });

  suite("getAssetItemType", () => {
    test("returns ERC20 ItemType for ERC20 token standard", () => {
      expect(getAssetItemType(TokenStandard.ERC20)).to.equal(ItemType.ERC20);
    });

    test("returns ERC721 ItemType for ERC721 token standard", () => {
      expect(getAssetItemType(TokenStandard.ERC721)).to.equal(ItemType.ERC721);
    });

    test("returns ERC1155 ItemType for ERC1155 token standard", () => {
      expect(getAssetItemType(TokenStandard.ERC1155)).to.equal(
        ItemType.ERC1155,
      );
    });

    test("throws for unknown token standard", () => {
      expect(() => getAssetItemType("UNKNOWN" as TokenStandard)).to.throw(
        "Unknown schema name: UNKNOWN",
      );
    });
  });

  suite("remapSharedStorefrontAddress", () => {
    test("returns checksummed lazy mint adapter address for shared storefront address", () => {
      for (const sharedStorefrontAddress of SHARED_STOREFRONT_ADDRESSES) {
        const result = remapSharedStorefrontAddress(sharedStorefrontAddress);
        expect(result).to.equal(
          ethers.getAddress(
            SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
          ),
        );
      }
    });

    test("returns checksummed address for non-shared storefront address", () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      const result = remapSharedStorefrontAddress(randomAddress);
      expect(result).to.equal(ethers.getAddress(randomAddress));
    });
  });

  suite("decodeTokenIds", () => {
    test("returns ['*'] when given '*' as input", () => {
      expect(decodeTokenIds("*")).to.deep.equal(["*"]);
    });

    test("returns [] when given empty string as input", () => {
      expect(decodeTokenIds("")).to.deep.equal([]);
    });

    test("correctly decodes a single number", () => {
      expect(decodeTokenIds("123")).to.deep.equal(["123"]);
    });

    test("correctly decodes multiple comma-separated numbers", () => {
      expect(decodeTokenIds("1,2,3,4")).to.deep.equal(["1", "2", "3", "4"]);
    });

    test("correctly decodes a range of numbers", () => {
      expect(decodeTokenIds("5:8")).to.deep.equal(["5", "6", "7", "8"]);
    });

    test("correctly decodes multiple ranges of numbers", () => {
      expect(decodeTokenIds("1:3,5:7")).to.deep.equal([
        "1",
        "2",
        "3",
        "5",
        "6",
        "7",
      ]);
    });

    test("correctly decodes a mix of single numbers and ranges", () => {
      expect(decodeTokenIds("1,3:5,8")).to.deep.equal([
        "1",
        "3",
        "4",
        "5",
        "8",
      ]);
    });

    test("handles very large numbers", () => {
      const largeNum = "999999999999999999999999999999";
      expect(decodeTokenIds(largeNum)).to.deep.equal([largeNum]);
    });

    test("handles range with very large numbers", () => {
      const result = decodeTokenIds(
        "999999999999999999999999999997:999999999999999999999999999999",
      );
      expect(result).to.deep.equal([
        "999999999999999999999999999997",
        "999999999999999999999999999998",
        "999999999999999999999999999999",
      ]);
    });

    test("throws error for invalid input format (letters)", () => {
      expect(() => decodeTokenIds("abc")).to.throw(
        "Invalid input format. Expected a valid comma-separated list of numbers and ranges.",
      );
    });

    test("throws error for invalid input format (mixed)", () => {
      expect(() => decodeTokenIds("1,2,abc")).to.throw("Invalid input format");
    });

    test("throws error for invalid range format (end < start)", () => {
      expect(() => decodeTokenIds("10:5")).to.throw(
        "Invalid range. End value: 5 must be greater than or equal to the start value: 10.",
      );
    });

    test("throws error for invalid range format (end = start - 1)", () => {
      expect(() => decodeTokenIds("5:4")).to.throw("Invalid range");
    });

    test("correctly decodes range where start = end", () => {
      expect(decodeTokenIds("5:5")).to.deep.equal(["5"]);
    });

    test("tolerates whitespace around delimiters", () => {
      expect(decodeTokenIds(" 1, 3:5, 8 ")).to.deep.equal([
        "1",
        "3",
        "4",
        "5",
        "8",
      ]);
      expect(decodeTokenIds("1 : 3")).to.deep.equal(["1", "2", "3"]);
      expect(decodeTokenIds("  *  ")).to.deep.equal(["*"]);
      expect(decodeTokenIds("   ")).to.deep.equal([]);
    });
  });

  suite("getSeaportInstance", () => {
    let mockSeaport: Seaport;

    test("returns seaport for CROSS_CHAIN_SEAPORT_V1_6_ADDRESS", () => {
      const provider = new ethers.JsonRpcProvider();
      mockSeaport = new Seaport(provider);

      const result = getSeaportInstance(
        CROSS_CHAIN_SEAPORT_V1_6_ADDRESS,
        mockSeaport,
      );
      expect(result).to.equal(mockSeaport);
    });

    test("returns seaport for ALTERNATE_SEAPORT_V1_6_ADDRESS", () => {
      const provider = new ethers.JsonRpcProvider();
      mockSeaport = new Seaport(provider);

      const result = getSeaportInstance(
        ALTERNATE_SEAPORT_V1_6_ADDRESS,
        mockSeaport,
      );
      expect(result).to.equal(mockSeaport);
    });

    test("throws error for unsupported protocol address", () => {
      const provider = new ethers.JsonRpcProvider();
      mockSeaport = new Seaport(provider);
      const randomAddress = ethers.Wallet.createRandom().address;

      expect(() => getSeaportInstance(randomAddress, mockSeaport)).to.throw(
        `Unsupported protocol address: ${randomAddress}`,
      );
    });

    test("works with lowercase address", () => {
      const provider = new ethers.JsonRpcProvider();
      mockSeaport = new Seaport(provider);

      const result = getSeaportInstance(
        CROSS_CHAIN_SEAPORT_V1_6_ADDRESS.toLowerCase(),
        mockSeaport,
      );
      expect(result).to.equal(mockSeaport);
    });
  });

  suite("getSeaportVersion", () => {
    test("returns '1.6' for CROSS_CHAIN_SEAPORT_V1_6_ADDRESS", () => {
      expect(getSeaportVersion(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS)).to.equal(
        "1.6",
      );
    });

    test("returns '1.6' for ALTERNATE_SEAPORT_V1_6_ADDRESS", () => {
      expect(getSeaportVersion(ALTERNATE_SEAPORT_V1_6_ADDRESS)).to.equal("1.6");
    });

    test("throws error for unsupported protocol address", () => {
      const randomAddress = ethers.Wallet.createRandom().address;
      expect(() => getSeaportVersion(randomAddress)).to.throw(
        `Unsupported protocol address: ${randomAddress}`,
      );
    });

    test("throws error for Seaport 1.5", () => {
      expect(() =>
        getSeaportVersion(CROSS_CHAIN_SEAPORT_V1_5_ADDRESS),
      ).to.throw("Unsupported protocol address");
    });

    test("works with lowercase address", () => {
      expect(
        getSeaportVersion(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS.toLowerCase()),
      ).to.equal("1.6");
    });

    test("works with checksum address", () => {
      expect(
        getSeaportVersion(ethers.getAddress(CROSS_CHAIN_SEAPORT_V1_6_ADDRESS)),
      ).to.equal("1.6");
    });
  });
});
