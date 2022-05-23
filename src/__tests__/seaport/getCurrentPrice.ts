import { expect } from "chai";
import { utils } from "ethers";
import { suite, test } from "mocha";
import { CROSS_CHAIN_SEAPORT_ADDRESS } from "seaport-js/lib/constants";
import Web3 from "web3";
import { RINKEBY_PROVIDER_URL } from "../../constants";
import { OpenSeaPort } from "../../index";
import { OrderV2 } from "../../orders/types";
import { Network } from "../../types";
import { RINKEBY_API_KEY } from "../constants";

// Client setup
const rinkebyProvider = new Web3.providers.HttpProvider(RINKEBY_PROVIDER_URL);
const rinkebyClient = new OpenSeaPort(rinkebyProvider, {
  networkName: Network.Rinkeby,
  apiKey: RINKEBY_API_KEY,
  // TODO: Remove once regular testnets (production unleash flags) supports seaport orders
  apiBaseUrl: "https://testnet-api.staging.openseabeta.com",
});

// temporary
const SEAPORT_PROTOCOL_DATA = {
  parameters: {
    offerer: "0xEAF54391793cc80DE696d72713d7518c6190bfe0",
    zone: "0x9B814233894Cd227f561B78Cc65891AA55C62Ad2",
    orderType: 0,
    startTime: "1652156665",
    endTime: "1654835065",
    salt: "35873643812057357",
    offer: [
      {
        itemType: 2,
        token: "0xf5de760f2e916647fd766B4AD9E85ff943cE3A2b",
        identifierOrCriteria: "1094",
        startAmount: "1",
        endAmount: "1",
      },
    ],
    consideration: [
      {
        itemType: 0,
        token: "0x0000000000000000000000000000000000000000",
        identifierOrCriteria: "0",
        startAmount: "975000000000000000",
        endAmount: "975000000000000000",
        recipient: "0xEAF54391793cc80DE696d72713d7518c6190bfe0",
      },
      {
        itemType: 0,
        token: "0x0000000000000000000000000000000000000000",
        identifierOrCriteria: "0",
        startAmount: "25000000000000000",
        endAmount: "25000000000000000",
        recipient: "0x5b3256965e7C3cF26E11FCAf296DfC8807C01073",
      },
    ],
    zoneHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    conduitKey:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    totalOriginalConsiderationItems: 2,
    nonce: 0,
  },
  signature: "0x",
};

// temporary
const ORDER = {
  protocolAddress: CROSS_CHAIN_SEAPORT_ADDRESS,
  protocolData: SEAPORT_PROTOCOL_DATA,
} as OrderV2;

suite.only("Getting current price of order", () => {
  (
    [
      "ask",
      // "bid", TODO: Add bid test
    ] as const
  ).forEach((side) => {
    test(`getCurrentPrice should return correct prices > ${side}`, async () => {
      const tokenAddressAndIdentifierToAmount =
        await rinkebyClient.getCurrentPrice({ order: { ...ORDER, side } });
      expect(tokenAddressAndIdentifierToAmount).to.not.be.undefined;

      const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
      const ETH_TOKEN_ID = "0";
      const identifierToAmount = tokenAddressAndIdentifierToAmount[ETH_ADDRESS];
      expect(identifierToAmount).to.not.be.undefined;

      expect(identifierToAmount[ETH_TOKEN_ID].toString()).to.equal(
        utils.parseEther("1").toString(),
        "The summed ETH price is incorrect"
      );
    });
  });
});
