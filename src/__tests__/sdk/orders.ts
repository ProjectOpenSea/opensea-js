import { BigNumber } from "bignumber.js";
import { assert } from "chai";
import { before, suite, test } from "mocha";
import Web3 from "web3";
import {
  INVERSE_BASIS_POINT,
  MAINNET_PROVIDER_URL,
  NULL_ADDRESS,
  OPENSEA_LEGACY_FEE_RECIPIENT,
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
  makeBigNumber,
  orderFromJSON,
} from "../../utils/utils";
import {
  ALEX_ADDRESS,
  ALEX_ADDRESS_2,
  CK_ADDRESS,
  CK_RINKEBY_ADDRESS,
  CK_RINKEBY_TOKEN_ID,
  CRYPTOFLOWERS_CONTRACT_ADDRESS_WITH_BUYER_FEE,
  DEVIN_ADDRESS,
  DIGITAL_ART_CHAIN_ADDRESS,
  DIGITAL_ART_CHAIN_TOKEN_ID,
  MAINNET_API_KEY,
  MYTHEREUM_ADDRESS,
  MYTHEREUM_TOKEN_ID,
  RINKEBY_API_KEY,
  WETH_ADDRESS,
} from "../constants";
import ordersJSONFixture from "../fixtures/orders.json";
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

suite("SDK: orders", () => {
  before(async () => {
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
    assert.equal(matchingOrder.feeRecipient, OPENSEA_LEGACY_FEE_RECIPIENT);
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
