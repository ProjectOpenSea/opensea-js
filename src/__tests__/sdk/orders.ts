import { BigNumber } from "bignumber.js";
import { assert } from "chai";
import { before, suite, test } from "mocha";
import Web3 from "web3";
import { HowToCall } from "wyvern-js/lib/types";
import {
  ENJIN_ADDRESS,
  INVERSE_BASIS_POINT,
  MAINNET_PROVIDER_URL,
  MERKLE_VALIDATOR_MAINNET,
  NULL_ADDRESS,
  OPENSEA_FEE_RECIPIENT,
  RINKEBY_PROVIDER_URL,
} from "../../constants";
import { OpenSeaSDK } from "../../index";
import {
  Asset,
  Network,
  Order,
  OrderJSON,
  OrderSide,
  SaleKind,
  UnhashedOrder,
  UnsignedOrder,
  WyvernSchemaName,
} from "../../types";
import {
  assignOrdersToSides,
  estimateCurrentPrice,
  getMaxOrderExpirationTimestamp,
  makeBigNumber,
  orderFromJSON,
} from "../../utils/utils";
import {
  AGE_OF_RUST_TOKEN_ID,
  ALEX_ADDRESS,
  ALEX_ADDRESS_2,
  CK_ADDRESS,
  CK_RINKEBY_ADDRESS,
  CK_RINKEBY_TOKEN_ID,
  CK_TOKEN_ID,
  CRYPTOFLOWERS_CONTRACT_ADDRESS_WITH_BUYER_FEE,
  DEVIN_ADDRESS,
  DIGITAL_ART_CHAIN_ADDRESS,
  DIGITAL_ART_CHAIN_TOKEN_ID,
  DISSOLUTION_TOKEN_ID,
  ENS_HELLO_NAME,
  ENS_HELLO_TOKEN_ID,
  ENS_RINKEBY_SHORT_NAME_OWNER,
  ENS_RINKEBY_TOKEN_ADDRESS,
  MAINNET_API_KEY,
  MYTHEREUM_ADDRESS,
  MYTHEREUM_TOKEN_ID,
  RINKEBY_API_KEY,
  WETH_ADDRESS,
} from "../constants";
import ordersJSONFixture from "../fixtures/orders.json";
import { areTimestampsNearlyEqual } from "../utils";
import { testFeesMakerOrder } from "./fees";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ordersJSON = ordersJSONFixture as any;
const englishSellOrderJSON = ordersJSON[0] as OrderJSON;

const provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);
const rinkebyProvider = new Web3.providers.HttpProvider(RINKEBY_PROVIDER_URL);

const client = new OpenSeaSDK(
  provider,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`)
);

const rinkebyClient = new OpenSeaSDK(
  rinkebyProvider,
  {
    networkName: Network.Rinkeby,
    apiKey: RINKEBY_API_KEY,
  },
  (line) => console.info(`RINKEBY: ${line}`)
);

const assetsForBundleOrder = [
  { tokenId: MYTHEREUM_TOKEN_ID.toString(), tokenAddress: MYTHEREUM_ADDRESS },
  {
    tokenId: DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
    tokenAddress: DIGITAL_ART_CHAIN_ADDRESS,
  },
];

const assetsForBulkTransfer = assetsForBundleOrder;

let manaAddress: string;
let daiAddress: string;

suite("SDK: orders", () => {
  before(async () => {
    daiAddress = (await client.api.getPaymentTokens({ symbol: "DAI" }))
      .tokens[0].address;
    manaAddress = (await client.api.getPaymentTokens({ symbol: "MANA" }))
      .tokens[0].address;
  });

  ordersJSON.map((orderJSON: OrderJSON, index: number) => {
    test("Order #" + index + " has correct types", () => {
      const order = orderFromJSON(orderJSON);
      assert.instanceOf(order.basePrice, BigNumber);
      assert.typeOf(order.maker, "string");
      assert.equal(+order.quantity, 1);
    });
  });

  test("Correctly sets decimals on fungible order", async () => {
    const accountAddress = ALEX_ADDRESS;
    const tokenId = DISSOLUTION_TOKEN_ID.toString();
    const tokenAddress = ENJIN_ADDRESS;
    const quantity = 1;
    const decimals = 2;

    const order = await client._makeSellOrder({
      asset: {
        tokenAddress,
        tokenId,
        decimals,
        schemaName: WyvernSchemaName.ERC1155,
      },
      quantity,
      accountAddress,
      startAmount: 2,
      extraBountyBasisPoints: 0,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
    });

    assert.equal(order.quantity.toNumber(), quantity * Math.pow(10, decimals));
  });

  test("Correctly errors for invalid sell order price parameters", async () => {
    const accountAddress = ALEX_ADDRESS;
    const expirationTime = Math.round(Date.now() / 1000 + 900); // fifteen minutes from now
    const paymentTokenAddress = manaAddress;
    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        paymentTokenAddress,
        waitForHighestBid: true,
        expirationTime: 0,
      });
      assert.fail();
    } catch (error) {
      assert.include((error as Error).message, "Expiration time cannot be 0");
    }

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        endAmount: 1, // Allow declining minimum bid
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        expirationTime,
        paymentTokenAddress: NULL_ADDRESS,
        waitForHighestBid: true,
      });
      assert.fail();
    } catch (error) {
      assert.include(
        (error as Error).message,
        "English auctions must use wrapped ETH"
      );
    }

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        endAmount: 3,
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        expirationTime,
        paymentTokenAddress: NULL_ADDRESS,
        waitForHighestBid: false,
      });
      assert.fail();
    } catch (error) {
      assert.include(
        (error as Error).message,
        "End price must be less than or equal to the start price"
      );
    }

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        endAmount: 1,
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        paymentTokenAddress: NULL_ADDRESS,
        waitForHighestBid: false,
        expirationTime: 0,
      });
      assert.fail();
    } catch (error) {
      assert.include(
        (error as Error).message,
        "Expiration time must be set if order will change in price"
      );
    }

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        listingTime: Math.round(Date.now() / 1000 - 60),
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        paymentTokenAddress: NULL_ADDRESS,
        waitForHighestBid: false,
      });
      assert.fail();
    } catch (error) {
      assert.include(
        (error as Error).message,
        "Listing time cannot be in the past"
      );
    }

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        listingTime: Math.round(Date.now() / 1000 + 20),
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        expirationTime,
        paymentTokenAddress,
        waitForHighestBid: true,
      });
      assert.fail();
    } catch (error) {
      assert.include(
        (error as Error).message,
        "Cannot schedule an English auction for the future"
      );
    }

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        expirationTime,
        paymentTokenAddress,
        waitForHighestBid: false,
        englishAuctionReservePrice: 1,
      });
      assert.fail();
    } catch (error) {
      assert.include(
        (error as Error).message,
        "Reserve prices may only be set on English auctions"
      );
    }

    try {
      await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        expirationTime,
        paymentTokenAddress,
        waitForHighestBid: true,
        englishAuctionReservePrice: 1,
      });
      assert.fail();
    } catch (error) {
      assert.include(
        (error as Error).message,
        "Reserve price must be greater than or equal to the start amount"
      );
    }
  });

  test("Correctly errors for invalid buy order price parameters", async () => {
    const accountAddress = ALEX_ADDRESS_2;
    const currentSeconds = Math.round(Date.now() / 1000);
    const expirationTime = currentSeconds + 20 * 60; // 20 minutes from now
    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    try {
      await client._makeBuyOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        extraBountyBasisPoints: 0,
        expirationTime,
        paymentTokenAddress: NULL_ADDRESS,
      });
      assert.fail();
    } catch (error) {
      assert.include(
        (error as Error).message,
        "Offers must use wrapped ETH or an ERC-20 token"
      );
    }
  });

  test("Cannot yet match a new English auction sell order, bountied", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS_2;
    const amountInToken = 1.2;
    const paymentTokenAddress = WETH_ADDRESS;
    const currentSeconds = Math.round(Date.now() / 1000);
    const expirationTime = currentSeconds + 20 * 60; // 20 minutes from now
    const bountyPercent = 1.1;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    const _asset = await client.api.getAsset({ tokenAddress, tokenId });

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      quantity: 1,
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress,
      extraBountyBasisPoints: bountyPercent * 100,
      buyerAddress: NULL_ADDRESS,
      expirationTime,
      waitForHighestBid: true,
    });

    assert.equal(order.taker, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
    assert.equal(order.extra.toNumber(), 0);
    // Make sure there's gap time to expire it
    assert.isAbove(order.expirationTime.toNumber(), expirationTime);
    // Make sure it's listed in the future
    assert.equal(order.listingTime.toNumber(), expirationTime);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is impossible
    try {
      await testMatchingNewOrder(order, takerAddress, expirationTime + 100);
      assert.fail();
    } catch (error) {
      assert.include(
        (error as Error).message,
        "Buy-side order is set in the future or expired"
      );
    }
  });

  test.skip("Can match a finished English auction sell order", async () => {
    const makerAddress = ALEX_ADDRESS_2;
    const takerAddress = ALEX_ADDRESS;
    const matcherAddress = DEVIN_ADDRESS;
    const now = Math.round(Date.now() / 1000);
    // Get bid from server
    const paymentTokenAddress = WETH_ADDRESS;
    const { orders } = await rinkebyClient.api.getOrdersLegacyWyvern({
      side: OrderSide.Buy,
      asset_contract_address: CK_RINKEBY_ADDRESS,
      token_id: CK_RINKEBY_TOKEN_ID,
      payment_token_address: paymentTokenAddress,
      maker: makerAddress,
    });
    const buy = orders[0];
    assert.isDefined(buy);
    assert.isDefined(buy.asset);
    if (!buy || !buy.asset) {
      return;
    }
    // Make sure it's listed in the past
    assert.isBelow(buy.listingTime.toNumber(), now);
    testFeesMakerOrder(buy, buy.asset.collection);

    const sell = orderFromJSON(englishSellOrderJSON);
    assert.equal(+sell.quantity, 1);
    assert.equal(sell.feeRecipient, NULL_ADDRESS);
    assert.equal(sell.paymentToken, paymentTokenAddress);

    /* Requirements in Wyvern contract for funds transfer. */
    assert.isAtMost(
      buy.takerRelayerFee.toNumber(),
      sell.takerRelayerFee.toNumber()
    );
    assert.isAtMost(
      buy.takerProtocolFee.toNumber(),
      sell.takerProtocolFee.toNumber()
    );
    const sellPrice = await rinkebyClient.getCurrentPriceLegacyWyvern(sell);
    const buyPrice = await rinkebyClient.getCurrentPriceLegacyWyvern(buy);
    assert.isAtLeast(buyPrice.toNumber(), sellPrice.toNumber());
    console.info(
      `Matching two orders that differ in price by ${
        buyPrice.toNumber() - sellPrice.toNumber()
      }`
    );

    await rinkebyClient._buyOrderValidationAndApprovals({
      order: buy,
      accountAddress: makerAddress,
    });
    await rinkebyClient._sellOrderValidationAndApprovals({
      order: sell,
      accountAddress: takerAddress,
    });

    const gas = await rinkebyClient._estimateGasForMatch({
      buy,
      sell,
      accountAddress: matcherAddress,
    });
    assert.isAbove(gas || 0, 0);
    console.info(`Match gas cost: ${gas}`);
  });

  test("Ensures buy order compatibility with an English sell order", async () => {
    const accountAddress = ALEX_ADDRESS_2;
    const takerAddress = ALEX_ADDRESS;
    const paymentTokenAddress = WETH_ADDRESS;
    const amountInToken = 0.01;
    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24); // one day from now
    const extraBountyBasisPoints = 1.1 * 100;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    const asset = await client.api.getAsset({ tokenAddress, tokenId });

    const sellOrder = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      quantity: 1,
      accountAddress: takerAddress,
      startAmount: amountInToken,
      paymentTokenAddress,
      expirationTime,
      extraBountyBasisPoints,
      buyerAddress: NULL_ADDRESS,
      waitForHighestBid: true,
    });

    const buyOrder = await client._makeBuyOrder({
      asset: { tokenAddress, tokenId, schemaName: WyvernSchemaName.ERC721 },
      quantity: 1,
      accountAddress,
      paymentTokenAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
      sellOrder,
    });

    testFeesMakerOrder(buyOrder, asset.collection);
    assert.equal(sellOrder.taker, NULL_ADDRESS);
    assert.equal(buyOrder.taker, sellOrder.maker);
    assert.equal(
      buyOrder.makerRelayerFee.toNumber(),
      sellOrder.makerRelayerFee.toNumber()
    );
    assert.equal(
      buyOrder.takerRelayerFee.toNumber(),
      sellOrder.takerRelayerFee.toNumber()
    );
    assert.equal(
      buyOrder.makerProtocolFee.toNumber(),
      sellOrder.makerProtocolFee.toNumber()
    );
    assert.equal(
      buyOrder.takerProtocolFee.toNumber(),
      sellOrder.takerProtocolFee.toNumber()
    );

    await client._buyOrderValidationAndApprovals({
      order: buyOrder,
      accountAddress,
    });
    await client._sellOrderValidationAndApprovals({
      order: sellOrder,
      accountAddress: takerAddress,
    });
  });

  test("Ensures ERC721v3 buy order compatibility with an English sell order", async () => {
    const accountAddress = ALEX_ADDRESS_2;
    const takerAddress = ALEX_ADDRESS;
    const paymentTokenAddress = WETH_ADDRESS;
    const amountInToken = 0.01;
    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24); // one day from now
    const extraBountyBasisPoints = 1.1 * 100;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    const asset = await client.api.getAsset({ tokenAddress, tokenId });

    const sellOrder = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      quantity: 1,
      accountAddress: takerAddress,
      startAmount: amountInToken,
      paymentTokenAddress,
      expirationTime,
      extraBountyBasisPoints,
      buyerAddress: NULL_ADDRESS,
      waitForHighestBid: true,
    });

    const buyOrder = await client._makeBuyOrder({
      asset: { tokenAddress, tokenId, schemaName: WyvernSchemaName.ERC721v3 },
      quantity: 1,
      accountAddress,
      paymentTokenAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
      sellOrder,
    });

    testFeesMakerOrder(buyOrder, asset.collection);
    assert.equal(sellOrder.taker, NULL_ADDRESS);
    assert.equal(buyOrder.taker, sellOrder.maker);
    assert.equal(
      buyOrder.makerRelayerFee.toNumber(),
      sellOrder.makerRelayerFee.toNumber()
    );
    assert.equal(
      buyOrder.takerRelayerFee.toNumber(),
      sellOrder.takerRelayerFee.toNumber()
    );
    assert.equal(
      buyOrder.makerProtocolFee.toNumber(),
      sellOrder.makerProtocolFee.toNumber()
    );
    assert.equal(
      buyOrder.takerProtocolFee.toNumber(),
      sellOrder.takerProtocolFee.toNumber()
    );

    await client._buyOrderValidationAndApprovals({
      order: buyOrder,
      accountAddress,
    });
    await client._sellOrderValidationAndApprovals({
      order: sellOrder,
      accountAddress: takerAddress,
    });
  });

  test("Ensures buy order compatibility with an ERC721v3 English sell order", async () => {
    const accountAddress = ALEX_ADDRESS_2;
    const takerAddress = ALEX_ADDRESS;
    const paymentTokenAddress = WETH_ADDRESS;
    const amountInToken = 0.01;
    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24); // one day from now
    const extraBountyBasisPoints = 1.1 * 100;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    const asset = await client.api.getAsset({ tokenAddress, tokenId });

    const sellOrder = await client._makeSellOrder({
      asset: { tokenAddress, tokenId, schemaName: WyvernSchemaName.ERC721v3 },
      quantity: 1,
      accountAddress: takerAddress,
      startAmount: amountInToken,
      paymentTokenAddress,
      expirationTime,
      extraBountyBasisPoints,
      buyerAddress: NULL_ADDRESS,
      waitForHighestBid: true,
    });

    const buyOrder = await client._makeBuyOrder({
      asset: { tokenAddress, tokenId },
      quantity: 1,
      accountAddress,
      paymentTokenAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
      sellOrder,
    });

    testFeesMakerOrder(buyOrder, asset.collection);
    assert.equal(sellOrder.taker, NULL_ADDRESS);
    assert.equal(buyOrder.taker, sellOrder.maker);
    assert.equal(
      buyOrder.makerRelayerFee.toNumber(),
      sellOrder.makerRelayerFee.toNumber()
    );
    assert.equal(
      buyOrder.takerRelayerFee.toNumber(),
      sellOrder.takerRelayerFee.toNumber()
    );
    assert.equal(
      buyOrder.makerProtocolFee.toNumber(),
      sellOrder.makerProtocolFee.toNumber()
    );
    assert.equal(
      buyOrder.takerProtocolFee.toNumber(),
      sellOrder.takerProtocolFee.toNumber()
    );

    await client._buyOrderValidationAndApprovals({
      order: buyOrder,
      accountAddress,
    });
    await client._sellOrderValidationAndApprovals({
      order: sellOrder,
      accountAddress: takerAddress,
    });
  });

  test.skip("Creates ENS name buy order", async () => {
    const paymentTokenAddress = WETH_ADDRESS;
    const _buyOrder = await rinkebyClient._makeBuyOrder({
      asset: {
        tokenId: ENS_HELLO_TOKEN_ID,
        tokenAddress: ENS_RINKEBY_TOKEN_ADDRESS,
        name: ENS_HELLO_NAME,
        schemaName: WyvernSchemaName.ENSShortNameAuction,
      },
      quantity: 1,
      accountAddress: ENS_RINKEBY_SHORT_NAME_OWNER,
      paymentTokenAddress,
      startAmount: 0.01,
      expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * 24), // one day from now
      extraBountyBasisPoints: 0,
    });
    // TODO (joshuawu): Fill this test out after backend supports ENS short names.
    // assert.equal(buyOrder, {})
  });

  test("Matches a private sell order, doesn't for wrong taker", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS_2;
    const amountInToken = 2;
    const bountyPercent = 1;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    const asset = await client.api.getAsset({ tokenAddress, tokenId });

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      quantity: 1,
      accountAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: bountyPercent * 100,
      buyerAddress: takerAddress,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
    });

    assert.equal(order.paymentToken, NULL_ADDRESS);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testFeesMakerOrder(order, asset.collection, bountyPercent * 100);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
    // Make sure no one else can take it
    try {
      await testMatchingNewOrder(order, DEVIN_ADDRESS);
    } catch (e) {
      // It works!
      return;
    }
    assert.fail();
  });

  test("Matches a new dutch sell order of a small amount of ERC-20 item (DAI) for ETH", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS_2;
    const amountInEth = 0.012;

    const tokenId = null;
    const tokenAddress = daiAddress;
    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24);

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId, schemaName: WyvernSchemaName.ERC20 },
      quantity: Math.pow(10, 18) * 0.01,
      accountAddress,
      startAmount: amountInEth,
      endAmount: 0,
      paymentTokenAddress: NULL_ADDRESS,
      extraBountyBasisPoints: 0,
      buyerAddress: NULL_ADDRESS,
      expirationTime, // one day from now,
      waitForHighestBid: false,
    });

    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    assert.equal(order.extra.toNumber(), Math.pow(10, 18) * amountInEth);
    assert.equal(order.expirationTime.toNumber(), expirationTime);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches a new sell order of an 1155 item for ETH", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS_2;
    const amountInEth = 2;

    const tokenId = AGE_OF_RUST_TOKEN_ID;
    const tokenAddress = ENJIN_ADDRESS;

    const asset = await client.api.getAsset({ tokenAddress, tokenId });

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId, schemaName: WyvernSchemaName.ERC1155 },
      quantity: 1,
      accountAddress,
      startAmount: amountInEth,
      paymentTokenAddress: NULL_ADDRESS,
      extraBountyBasisPoints: 0,
      buyerAddress: NULL_ADDRESS,
      waitForHighestBid: false,
    });

    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testFeesMakerOrder(order, asset.collection);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches a buy order of an 1155 item for W-ETH", async () => {
    const accountAddress = ALEX_ADDRESS_2;
    const takerAddress = ALEX_ADDRESS;
    const paymentToken = WETH_ADDRESS;
    const amountInToken = 0.01;

    const tokenId = DISSOLUTION_TOKEN_ID;
    const tokenAddress = ENJIN_ADDRESS;

    const asset = await client.api.getAsset({ tokenAddress, tokenId });

    const order = await client._makeBuyOrder({
      asset: { tokenAddress, tokenId, schemaName: WyvernSchemaName.ERC1155 },
      quantity: 1,
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress: paymentToken,
      extraBountyBasisPoints: 0,
    });

    assert.equal(order.taker, NULL_ADDRESS);
    assert.equal(order.paymentToken, paymentToken);
    assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testFeesMakerOrder(order, asset.collection);

    await client._buyOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches a new bountied sell order for an ERC-20 token (MANA)", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS_2;
    const paymentToken = (await client.api.getPaymentTokens({ symbol: "MANA" }))
      .tokens[0];
    const amountInToken = 5000;
    const bountyPercent = 1;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    const asset = await client.api.getAsset({ tokenAddress, tokenId });

    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      quantity: 1,
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress: paymentToken.address,
      extraBountyBasisPoints: bountyPercent * 100,
      buyerAddress: NULL_ADDRESS, // Check that null doesn't trigger private orders
      waitForHighestBid: false,
    });

    assert.equal(order.paymentToken, paymentToken.address);
    assert.equal(
      order.basePrice.toNumber(),
      Math.pow(10, paymentToken.decimals) * amountInToken
    );
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testFeesMakerOrder(order, asset.collection, bountyPercent * 100);

    await client._sellOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Matches a buy order with an ERC-20 token (DAI)", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS_2;
    const paymentToken = (await client.api.getPaymentTokens({ symbol: "DAI" }))
      .tokens[0];
    const amountInToken = 3;

    const tokenId = CK_TOKEN_ID.toString();
    const tokenAddress = CK_ADDRESS;

    const asset = await client.api.getAsset({ tokenAddress, tokenId });

    const order = await client._makeBuyOrder({
      asset: { tokenAddress, tokenId },
      quantity: 1,
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress: paymentToken.address,
      extraBountyBasisPoints: 0,
    });

    assert.equal(order.taker, NULL_ADDRESS);
    assert.equal(order.paymentToken, paymentToken.address);
    assert.equal(
      order.basePrice.toNumber(),
      Math.pow(10, paymentToken.decimals) * amountInToken
    );
    assert.equal(order.extra.toNumber(), 0);
    assert.notEqual(order.expirationTime.toNumber(), 0);
    assert.isTrue(
      areTimestampsNearlyEqual(
        getMaxOrderExpirationTimestamp(),
        order.expirationTime.toNumber()
      )
    );
    testFeesMakerOrder(order, asset.collection);

    await client._buyOrderValidationAndApprovals({ order, accountAddress });
    // Make sure match is valid
    await testMatchingNewOrder(order, takerAddress);
  });

  test("Serializes payment token and matches most recent ERC-20 sell order", async () => {
    const takerAddress = ALEX_ADDRESS;

    const order = await client.api.getOrderLegacyWyvern({
      side: OrderSide.Sell,
      payment_token_address: manaAddress,
      taker: NULL_ADDRESS,
    });

    assert.isNotNull(order.paymentTokenContract);
    if (!order.paymentTokenContract) {
      return;
    }
    assert.equal(order.paymentTokenContract.address, manaAddress);
    assert.equal(order.paymentToken, manaAddress);
    // TODO why can't we test atomicMatch?
    await testMatchingOrder(order, takerAddress, false);
  });

  test("Bulk transfer", async () => {
    const accountAddress = ALEX_ADDRESS;
    const takerAddress = ALEX_ADDRESS_2;

    const gas = await client._estimateGasForTransfer({
      assets: assetsForBulkTransfer,
      fromAddress: accountAddress,
      toAddress: takerAddress,
    });

    assert.isAbove(gas, 0);
  });

  test("Fungible tokens filter", async () => {
    const manaTokens = (await client.api.getPaymentTokens({ symbol: "MANA" }))
      .tokens;
    assert.equal(manaTokens.length, 1);
    const mana = manaTokens[0];
    assert.isNotNull(mana);
    assert.equal(mana.name, "Decentraland MANA");
    assert.equal(mana.address, "0x0f5d2fb29fb7d3cfee444a200298f468908cc942");
    assert.equal(mana.decimals, 18);

    const dai = (await client.api.getPaymentTokens({ symbol: "DAI" }))
      .tokens[0];
    assert.isNotNull(dai);
    assert.equal(dai.name, "Dai Stablecoin");
    assert.equal(dai.decimals, 18);

    const all = await client.api.getPaymentTokens();
    assert.isNotEmpty(all);
  });

  // Temp skip due to migration
  test.skip("orderToJSON computes correct current price for Dutch auctions", async () => {
    const { orders } = await client.api.getOrdersLegacyWyvern({
      sale_kind: SaleKind.DutchAuction,
      side: OrderSide.Sell,
    });
    assert.equal(orders.length, client.api.pageSize);
    orders.map((order) => {
      assert.isNotNull(order.currentPrice);
      const buyerFeeBPS = order.asset
        ? order.asset.assetContract.buyerFeeBasisPoints
        : order.assetBundle && order.assetBundle.assetContract
        ? order.assetBundle.assetContract.buyerFeeBasisPoints
        : null;
      if (!order.currentPrice || buyerFeeBPS) {
        // Skip checks with buyer fees
        return;
      }
      const multiple =
        order.side == OrderSide.Sell
          ? +order.takerRelayerFee / INVERSE_BASIS_POINT + 1
          : 1;
      // Possible race condition
      assert.equal(
        order.currentPrice.toPrecision(3),
        estimateCurrentPrice(order).toPrecision(3)
      );
      assert.isAtLeast(
        order.basePrice.times(multiple).toNumber(),
        order.currentPrice.toNumber()
      );
    });
  });

  // Skipping brittle test, due to token id dependency
  test.skip("orderToJSON current price includes buyer fee", async () => {
    const { orders } = await client.api.getOrdersLegacyWyvern({
      sale_kind: SaleKind.FixedPrice,
      asset_contract_address: CRYPTOFLOWERS_CONTRACT_ADDRESS_WITH_BUYER_FEE,
      token_id: 8645,
      bundled: false,
      side: OrderSide.Sell,
      is_english: false,
    });
    assert.isNotEmpty(orders);
    orders.map((order) => {
      assert.isNotNull(order.currentPrice);
      assert.isNotNull(order.asset);
      if (!order.currentPrice || !order.asset) {
        return;
      }
      const buyerFeeBPS = order.takerRelayerFee;
      const multiple = +buyerFeeBPS / INVERSE_BASIS_POINT + 1;
      assert.equal(
        order.basePrice.times(multiple).toNumber(),
        estimateCurrentPrice(order).toNumber()
      );
    });
  });

  // Flaky due to DB statement timeout
  test.skip("orderToJSON current price does not include buyer fee for English auctions", async () => {
    const { orders } = await client.api.getOrdersLegacyWyvern({
      side: OrderSide.Sell,
      is_english: true,
    });
    assert.isNotEmpty(orders);
    orders.map((order) => {
      assert.isNotNull(order.currentPrice);
      assert.isNotNull(order.asset);
      if (!order.currentPrice || !order.asset) {
        return;
      }
      assert.equal(
        order.basePrice.toNumber(),
        estimateCurrentPrice(order).toNumber()
      );
    });
  });

  test.skip("Matches first buy order in book", async () => {
    const order = await client.api.getOrderLegacyWyvern({
      side: OrderSide.Buy,
    });
    assert.isNotNull(order);
    if (!order) {
      return;
    }
    const assetOrBundle = order.asset || order.assetBundle;
    assert.isNotNull(assetOrBundle);
    if (!assetOrBundle) {
      return;
    }
    const takerAddress = order.maker;
    // Taker might not have all approval permissions so only test match
    await testMatchingOrder(order, takerAddress, false);
  });

  test.skip("Matches a buy order and estimates gas on fulfillment", async () => {
    // Need to use a taker who has created a proxy and approved W-ETH already
    const takerAddress = ALEX_ADDRESS;

    const order = await client.api.getOrderLegacyWyvern({
      side: OrderSide.Buy,
      owner: takerAddress,
      // Use a token that has already been approved via approve-all
      asset_contract_address: DIGITAL_ART_CHAIN_ADDRESS,
      token_id: DIGITAL_ART_CHAIN_TOKEN_ID,
    });
    assert.isNotNull(order);
    if (!order) {
      return;
    }
    assert.isNotNull(order.asset);
    if (!order.asset) {
      return;
    }
    await testMatchingOrder(order, takerAddress, true);
  });

  test("Correct order data on merkle ERC721 listing", async () => {
    const accountAddress = ALEX_ADDRESS;
    const tokenId = DISSOLUTION_TOKEN_ID.toString();
    const tokenAddress = ENJIN_ADDRESS;
    const quantity = 1;
    const decimals = 2;

    const order = await client._makeSellOrder({
      asset: {
        tokenAddress,
        tokenId,
        decimals,
        schemaName: WyvernSchemaName.ERC721,
      },
      quantity,
      accountAddress,
      startAmount: 2,
      extraBountyBasisPoints: 0,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
    });

    assert.equal(order["target"], MERKLE_VALIDATOR_MAINNET);
    assert.equal(
      order["replacementPattern"],
      "0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    );
    assert.equal(order.howToCall, HowToCall.DelegateCall);
  });

  test("Correct order data on merkle ERC1155 listing", async () => {
    const accountAddress = ALEX_ADDRESS;
    const tokenId = DISSOLUTION_TOKEN_ID.toString();
    const tokenAddress = ENJIN_ADDRESS;
    const quantity = 1;
    const decimals = 2;

    const order = await client._makeSellOrder({
      asset: {
        tokenAddress,
        tokenId,
        decimals,
        schemaName: WyvernSchemaName.ERC1155,
      },
      quantity,
      accountAddress,
      startAmount: 2,
      extraBountyBasisPoints: 0,
      buyerAddress: NULL_ADDRESS,
      paymentTokenAddress: NULL_ADDRESS,
      waitForHighestBid: false,
    });

    assert.equal(order["target"], MERKLE_VALIDATOR_MAINNET);
    assert.equal(
      order["replacementPattern"],
      "0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    );
    assert.equal(order.howToCall, HowToCall.DelegateCall);
  });

  test("Correct order data on merkle ERC721 offer", async () => {
    const accountAddress = ALEX_ADDRESS_2;
    const paymentTokenAddress = WETH_ADDRESS;
    const amountInToken = 0.01;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    const order = await client._makeBuyOrder({
      asset: { tokenAddress, tokenId, schemaName: WyvernSchemaName.ERC721 },
      quantity: 1,
      accountAddress,
      paymentTokenAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
    });

    assert.equal(order["target"], MERKLE_VALIDATOR_MAINNET);
    assert.equal(
      order["replacementPattern"],
      "0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    );
    assert.equal(order.howToCall, HowToCall.DelegateCall);
  });

  test("Correct order data on merkle ERC1155 offer", async () => {
    const accountAddress = ALEX_ADDRESS_2;
    const paymentTokenAddress = WETH_ADDRESS;
    const amountInToken = 0.01;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    const order = await client._makeBuyOrder({
      asset: { tokenAddress, tokenId, schemaName: WyvernSchemaName.ERC1155 },
      quantity: 1,
      accountAddress,
      paymentTokenAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
    });

    assert.equal(order["target"], MERKLE_VALIDATOR_MAINNET);
    assert.equal(
      order["replacementPattern"],
      "0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    );
    assert.equal(order.howToCall, HowToCall.DelegateCall);
  });

  test("Verify no merkle data on ERC721 english auction listing and bids", async () => {
    const accountAddress = ALEX_ADDRESS_2;
    const takerAddress = ALEX_ADDRESS;
    const paymentTokenAddress = WETH_ADDRESS;
    const amountInToken = 0.01;
    const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24); // one day from now
    const extraBountyBasisPoints = 1.1 * 100;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;

    const sellOrder = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      quantity: 1,
      accountAddress: takerAddress,
      startAmount: amountInToken,
      paymentTokenAddress,
      expirationTime,
      extraBountyBasisPoints,
      buyerAddress: NULL_ADDRESS,
      waitForHighestBid: true,
    });

    assert.equal(sellOrder["target"], tokenAddress);
    assert.equal(
      sellOrder["replacementPattern"],
      "0x000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000"
    );
    assert.equal(sellOrder.howToCall, HowToCall.Call);

    const buyOrder = await client._makeBuyOrder({
      asset: { tokenAddress, tokenId, schemaName: WyvernSchemaName.ERC721 },
      quantity: 1,
      accountAddress,
      paymentTokenAddress,
      startAmount: amountInToken,
      extraBountyBasisPoints: 0,
      sellOrder,
    });

    assert.equal(buyOrder["target"], tokenAddress);
    assert.equal(
      buyOrder["replacementPattern"],
      "0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
    );
    assert.equal(buyOrder.howToCall, HowToCall.Call);
  });

  suite("Expiration times", () => {
    test("it fails when expiration time is 0", async () => {
      const accountAddress = ALEX_ADDRESS;
      const paymentTokenAddress = manaAddress;
      const tokenId = MYTHEREUM_TOKEN_ID.toString();
      const tokenAddress = MYTHEREUM_ADDRESS;

      try {
        await client._makeSellOrder({
          asset: { tokenAddress, tokenId },
          quantity: 1,
          accountAddress,
          startAmount: 2,
          extraBountyBasisPoints: 0,
          buyerAddress: NULL_ADDRESS,
          paymentTokenAddress,
          waitForHighestBid: false,
          expirationTime: 0,
        });
        assert.fail();
      } catch (error) {
        assert.include((error as Error).message, "Expiration time cannot be 0");
      }

      try {
        await client._makeBuyOrder({
          asset: { tokenAddress, tokenId },
          quantity: 1,
          accountAddress,
          startAmount: 2,
          extraBountyBasisPoints: 0,
          paymentTokenAddress,
          expirationTime: 0,
        });
        assert.fail();
      } catch (error) {
        assert.include((error as Error).message, "Expiration time cannot be 0");
      }
    });

    test("it fails when expiration time exceeds six months", async () => {
      const accountAddress = ALEX_ADDRESS;
      const paymentTokenAddress = manaAddress;
      const tokenId = MYTHEREUM_TOKEN_ID.toString();
      const tokenAddress = MYTHEREUM_ADDRESS;

      const expirationDate = new Date();

      expirationDate.setMonth(expirationDate.getMonth() + 7);

      const expirationTime = Math.round(expirationDate.getTime() / 1000);

      try {
        await client._makeSellOrder({
          asset: { tokenAddress, tokenId },
          quantity: 1,
          accountAddress,
          startAmount: 2,
          extraBountyBasisPoints: 0,
          buyerAddress: NULL_ADDRESS,
          paymentTokenAddress,
          waitForHighestBid: false,
          expirationTime,
        });
        assert.fail();
      } catch (error) {
        assert.include(
          (error as Error).message,
          "Expiration time must not exceed six months from now"
        );
      }

      try {
        await client._makeBuyOrder({
          asset: { tokenAddress, tokenId },
          quantity: 1,
          accountAddress,
          startAmount: 2,
          extraBountyBasisPoints: 0,
          paymentTokenAddress,
          expirationTime,
        });
        assert.fail();
      } catch (error) {
        assert.include(
          (error as Error).message,
          "Expiration time must not exceed six months from now"
        );
      }
    });

    test("it handles expiration time duration correctly", async () => {
      const accountAddress = ALEX_ADDRESS;
      const paymentTokenAddress = manaAddress;
      const tokenId = MYTHEREUM_TOKEN_ID.toString();
      const tokenAddress = MYTHEREUM_ADDRESS;

      // Added buffer
      const listingTime = Math.floor(new Date().getTime() / 1000) + 60;

      // 10 minutes after
      const expirationTime = listingTime + 600;

      try {
        await client._makeSellOrder({
          asset: { tokenAddress, tokenId },
          quantity: 1,
          accountAddress,
          startAmount: 2,
          extraBountyBasisPoints: 0,
          buyerAddress: NULL_ADDRESS,
          paymentTokenAddress,
          waitForHighestBid: false,
          listingTime,
          expirationTime,
        });
        assert.fail();
      } catch (error) {
        assert.include(
          (error as Error).message,
          `Expiration time must be at least 15 minutes from the listing date`
        );
      }

      try {
        await client._makeBuyOrder({
          asset: { tokenAddress, tokenId },
          quantity: 1,
          accountAddress,
          startAmount: 2,
          extraBountyBasisPoints: 0,
          paymentTokenAddress,
          expirationTime,
        });
        assert.fail();
      } catch (error) {
        assert.include(
          (error as Error).message,
          `Expiration time must be at least 15 minutes from the listing date`
        );
      }

      const twentyMinuteExpirationTime = expirationTime + 600;

      const sellOrder = await client._makeSellOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        extraBountyBasisPoints: 0,
        buyerAddress: NULL_ADDRESS,
        paymentTokenAddress,
        waitForHighestBid: false,
        listingTime,
        // 20 minutes after listing time
        expirationTime: twentyMinuteExpirationTime,
      });

      assert.equal(
        sellOrder["expirationTime"].toNumber(),
        twentyMinuteExpirationTime
      );

      const buyOrder = await client._makeBuyOrder({
        asset: { tokenAddress, tokenId },
        quantity: 1,
        accountAddress,
        startAmount: 2,
        extraBountyBasisPoints: 0,
        paymentTokenAddress,
        expirationTime: twentyMinuteExpirationTime,
      });

      assert.equal(
        buyOrder["expirationTime"].toNumber(),
        twentyMinuteExpirationTime
      );
    });
  });
});

async function testMatchingOrder(
  order: Order,
  accountAddress: string,
  testAtomicMatch = false,
  referrerAddress?: string
) {
  // Test a separate recipient for sell orders
  const recipientAddress =
    order.side === OrderSide.Sell ? ALEX_ADDRESS_2 : accountAddress;
  const matchingOrder = client._makeMatchingOrder({
    order,
    accountAddress,
    recipientAddress,
  });

  const { buy, sell } = assignOrdersToSides(order, matchingOrder);

  if (!order.waitingForBestCounterOrder) {
    const isValid = await client._validateMatch({ buy, sell, accountAddress });
    assert.isTrue(isValid);
  } else {
    console.info(`English Auction detected, skipping validation`);
  }

  if (testAtomicMatch && !order.waitingForBestCounterOrder) {
    const isValid = await client._validateOrder(order);
    assert.isTrue(isValid);
    const isFulfillable = await client.isOrderFulfillableLegacyWyvern({
      order,
      accountAddress,
      recipientAddress,
      referrerAddress,
    });
    assert.isTrue(isFulfillable);
  }
}

export async function testMatchingNewOrder(
  order: UnhashedOrder,
  accountAddress: string,
  counterOrderListingTime?: number
) {
  const matchingOrder = client._makeMatchingOrder({
    order,
    accountAddress,
    recipientAddress: accountAddress,
  });
  if (counterOrderListingTime != null) {
    matchingOrder.listingTime = makeBigNumber(counterOrderListingTime);
  }

  // Test fees
  assert.equal(matchingOrder.makerProtocolFee.toNumber(), 0);
  assert.equal(matchingOrder.takerProtocolFee.toNumber(), 0);
  if (order.waitingForBestCounterOrder) {
    assert.equal(matchingOrder.feeRecipient, OPENSEA_FEE_RECIPIENT);
  } else {
    assert.equal(matchingOrder.feeRecipient, NULL_ADDRESS);
  }
  assert.equal(
    matchingOrder.makerRelayerFee.toNumber(),
    order.makerRelayerFee.toNumber()
  );
  assert.equal(
    matchingOrder.takerRelayerFee.toNumber(),
    order.takerRelayerFee.toNumber()
  );
  assert.equal(
    matchingOrder.makerReferrerFee.toNumber(),
    order.makerReferrerFee.toNumber()
  );

  const v = 27;
  const r = "";
  const s = "";

  let buy: Order;
  let sell: Order;
  if (order.side == OrderSide.Buy) {
    buy = {
      ...order,
      v,
      r,
      s,
    };
    sell = {
      ...matchingOrder,
      v,
      r,
      s,
    };
  } else {
    sell = {
      ...order,
      v,
      r,
      s,
    };
    buy = {
      ...matchingOrder,
      v,
      r,
      s,
    };
  }

  const isValid = await client._validateMatch({ buy, sell, accountAddress });
  assert.isTrue(isValid);

  // Make sure assets are transferrable
  await Promise.all(
    getAssetsAndQuantities(order).map(async ({ asset, quantity }) => {
      const fromAddress = sell.maker;
      const toAddress = buy.maker;
      const useProxy =
        asset.tokenAddress === CK_ADDRESS ||
        asset.schemaName === WyvernSchemaName.ERC20;
      const isTransferrable = await client.isAssetTransferrable({
        asset,
        quantity,
        fromAddress,
        toAddress,
        useProxy,
      });
      assert.isTrue(
        isTransferrable,
        `Not transferrable: ${asset.tokenAddress} # ${asset.tokenId} schema ${asset.schemaName} quantity ${quantity} from ${fromAddress} to ${toAddress} using proxy: ${useProxy}`
      );
    })
  );
}

function getAssetsAndQuantities(
  order: Order | UnsignedOrder | UnhashedOrder
): Array<{ asset: Asset; quantity: BigNumber }> {
  const wyAssets =
    "bundle" in order.metadata
      ? order.metadata.bundle.assets
      : order.metadata.asset
      ? [order.metadata.asset]
      : [];
  const schemaNames =
    "bundle" in order.metadata && "schemas" in order.metadata.bundle
      ? order.metadata.bundle.schemas
      : "schema" in order.metadata
      ? [order.metadata.schema]
      : [];

  assert.isNotEmpty(wyAssets);
  assert.equal(wyAssets.length, schemaNames.length);

  return wyAssets.map((wyAsset, i) => {
    const asset: Asset = {
      tokenId: "id" in wyAsset && wyAsset.id != null ? wyAsset.id : null,
      tokenAddress: wyAsset.address,
      schemaName: schemaNames[i],
    };
    if ("quantity" in wyAsset) {
      return { asset, quantity: new BigNumber(wyAsset.quantity) };
    } else {
      return { asset, quantity: new BigNumber(1) };
    }
  });
}
