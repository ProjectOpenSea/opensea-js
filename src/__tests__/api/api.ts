import { assert } from "chai";
import { suite, test } from "mocha";
import Web3 from "web3";
import { WyvernProtocol } from "wyvern-js";
import {
  MAINNET_PROVIDER_URL,
  MIN_EXPIRATION_MINUTES,
  NULL_ADDRESS,
  ORDERBOOK_VERSION,
  ORDER_MATCHING_LATENCY_SECONDS,
} from "../../constants";
import { orderToJSON, OpenSeaSDK } from "../../index";
import { Network, OrderSide } from "../../types";
import { getOrderHash, makeBigNumber } from "../../utils/utils";
import {
  ALEX_ADDRESS,
  ALEX_ADDRESS_2,
  apiToTest,
  CK_RINKEBY_ADDRESS,
  CK_RINKEBY_SELLER_FEE,
  CK_RINKEBY_TOKEN_ID,
  mainApi,
  MAINNET_API_KEY,
  MYTHEREUM_ADDRESS,
  MYTHEREUM_TOKEN_ID,
  rinkebyApi,
  RINKEBY_API_KEY,
  WETH_ADDRESS,
} from "../constants";

const provider = new Web3.providers.HttpProvider(MAINNET_PROVIDER_URL);

const client = new OpenSeaSDK(
  provider,
  {
    networkName: Network.Main,
    apiKey: MAINNET_API_KEY,
  },
  (line) => console.info(`MAINNET: ${line}`)
);

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

  test("orderToJSON is correct", async () => {
    const accountAddress = ALEX_ADDRESS;
    const quantity = 1;
    const amountInToken = 1.2;
    const paymentTokenAddress = WETH_ADDRESS;
    const extraBountyBasisPoints = 0;
    const expirationTime = Math.round(
      Date.now() / 1000 + (MIN_EXPIRATION_MINUTES + 1) * 60
    ); // sixteen minutes from now
    const englishAuctionReservePrice = 2;

    const tokenId = MYTHEREUM_TOKEN_ID.toString();
    const tokenAddress = MYTHEREUM_ADDRESS;
    const order = await client._makeSellOrder({
      asset: { tokenAddress, tokenId },
      quantity,
      accountAddress,
      startAmount: amountInToken,
      paymentTokenAddress,
      extraBountyBasisPoints,
      buyerAddress: NULL_ADDRESS,
      expirationTime,
      waitForHighestBid: true,
      englishAuctionReservePrice,
    });

    const hashedOrder = {
      ...order,
      hash: getOrderHash(order),
    };

    const orderData = orderToJSON(hashedOrder);
    assert.equal(orderData.quantity, quantity.toString());
    assert.equal(orderData.maker, accountAddress);
    assert.equal(orderData.taker, NULL_ADDRESS);
    assert.equal(
      orderData.basePrice,
      WyvernProtocol.toBaseUnitAmount(
        makeBigNumber(amountInToken),
        18
      ).toString()
    );
    assert.equal(orderData.paymentToken, paymentTokenAddress);
    assert.equal(orderData.extra, extraBountyBasisPoints.toString());
    assert.equal(
      orderData.expirationTime,
      expirationTime + ORDER_MATCHING_LATENCY_SECONDS
    );
    assert.equal(
      orderData.englishAuctionReservePrice,
      WyvernProtocol.toBaseUnitAmount(
        makeBigNumber(englishAuctionReservePrice),
        18
      ).toString()
    );
  });

  test("API fetches tokens", async () => {
    const { tokens } = await apiToTest.getPaymentTokens({ symbol: "MANA" });
    assert.isArray(tokens);
    assert.equal(tokens.length, 1);
    assert.equal(tokens[0].name, "Decentraland MANA");
  });

  test("Rinkeby API orders have correct OpenSea url", async () => {
    const order = await rinkebyApi.getOrderLegacyWyvern({});
    if (!order.asset) {
      return;
    }
    const url = `https://testnets.opensea.io/assets/rinkeby/${order.asset.assetContract.address}/${order.asset.tokenId}`;
    assert.equal(order.asset.openseaLink, url);
  });

  test("Mainnet API orders have correct OpenSea url", async () => {
    const order = await mainApi.getOrderLegacyWyvern({});
    if (!order.asset) {
      return;
    }
    const url = `https://opensea.io/assets/ethereum/${order.asset.assetContract.address}/${order.asset.tokenId}`;
    assert.equal(order.asset.openseaLink, url);
  });

  test("API fetches orderbook", async () => {
    const { orders, count } = await apiToTest.getOrdersLegacyWyvern();
    assert.isArray(orders);
    assert.isNumber(count);
    assert.equal(orders.length, apiToTest.pageSize);
    // assert.isAtLeast(count, orders.length)
  });

  test("API can change page size", async () => {
    const defaultPageSize = apiToTest.pageSize;
    apiToTest.pageSize = 7;
    const { orders } = await apiToTest.getOrdersLegacyWyvern();
    assert.equal(orders.length, 7);
    apiToTest.pageSize = defaultPageSize;
  });

  if (ORDERBOOK_VERSION > 0) {
    test("API orderbook paginates", async () => {
      const { orders, count } = await apiToTest.getOrdersLegacyWyvern();
      const pagination = await apiToTest.getOrdersLegacyWyvern({}, 2);
      assert.equal(pagination.orders.length, apiToTest.pageSize);
      assert.notDeepEqual(pagination.orders[0], orders[0]);
      assert.equal(pagination.count, count);
    });
  }

  test("API fetches orders for asset", async () => {
    const forKitty = await apiToTest.getOrdersLegacyWyvern({
      asset_contract_address: CK_RINKEBY_ADDRESS,
      token_id: CK_RINKEBY_TOKEN_ID,
      side: OrderSide.Buy,
    });
    assert.isArray(forKitty.orders);
  });

  // Temp skip due to migration
  test.skip("API fetches orders for asset owner", async () => {
    const forOwner = await apiToTest.getOrdersLegacyWyvern({
      owner: ALEX_ADDRESS,
    });
    assert.isAbove(forOwner.orders.length, 0);
    assert.isAbove(forOwner.count, 0);
    const owners = forOwner.orders.map(
      (o) => o.asset && o.asset.owner && o.asset.owner.address
    );
    owners.forEach((owner) => {
      assert.include([ALEX_ADDRESS, NULL_ADDRESS], owner);
    });
  });

  // Temp skip due to migration
  test.skip("API fetches buy orders for maker", async () => {
    const forMaker = await apiToTest.getOrdersLegacyWyvern({
      maker: ALEX_ADDRESS_2,
      side: OrderSide.Buy,
    });
    assert.isAbove(forMaker.orders.length, 0);
    assert.isAbove(forMaker.count, 0);
    forMaker.orders.forEach((order) => {
      assert.equal(ALEX_ADDRESS_2, order.maker);
      assert.equal(OrderSide.Buy, order.side);
    });
  });

  test("API excludes cancelledOrFinalized and markedInvalid orders", async () => {
    const { orders } = await apiToTest.getOrdersLegacyWyvern({ limit: 50 });
    const finishedOrders = orders.filter((o) => o.cancelledOrFinalized);
    assert.isEmpty(finishedOrders);
    const invalidOrders = orders.filter((o) => o.markedInvalid);
    assert.isEmpty(invalidOrders);
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

    // 400 malformed
    const res = await apiToTest.getOrdersLegacyWyvern({
      // Get an old order to make sure listing time is too early
      listed_before: Math.round(Date.now() / 1000 - 3600),
      side: OrderSide.Sell,
    });
    const order = res.orders[0];
    assert.isNotNull(order);

    try {
      const newOrder = {
        ...orderToJSON(order),
        v: 1,
        r: "",
        s: "",
      };
      await apiToTest.postOrderLegacyWyvern(newOrder);
    } catch (error) {
      // TODO sometimes the error is "Expected the listing time to be at or past the current time"
      // assert.include(error.message, "Order failed exchange validation")
    }
  });
});
