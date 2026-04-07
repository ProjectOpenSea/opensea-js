import { describe, expect, test, vi } from "vitest"
import { OrdersAPI } from "../../src/api/orders"
import {
  type GetOrderByHashResponse,
  type Listing,
  type Offer,
  OrderStatus,
} from "../../src/api/types"
import { OrderType, type ProtocolData } from "../../src/orders/types"
import { Chain } from "../../src/types"
import { createMockFetcher } from "../fixtures/fetcher"

describe("API: OrdersAPI.getOrderByHash", () => {
  let mockGet: ReturnType<typeof vi.fn>
  let ordersAPI: OrdersAPI

  beforeEach(() => {
    const { fetcher, mockGet: getMock } = createMockFetcher()
    mockGet = getMock
    ordersAPI = new OrdersAPI(fetcher, Chain.Mainnet)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test("returns an Offer type response", async () => {
    const mockOffer: Offer = {
      order_hash:
        "0x143be64aaf5d170c61e56ceb37dff0f8494e2630a7eae3eb24c8edbef09af9d5",
      chain: "ethereum",
      protocol_data: {
        parameters: {
          offerer: "0xaf68f720d7e51b88a76ec35aab2b1694f8f0892a",
          offer: [
            {
              itemType: 1,
              token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              identifierOrCriteria: "0",
              startAmount: "5480000000000000000",
              endAmount: "5480000000000000000",
            },
          ],
          consideration: [],
          startTime: "1765058920",
          endTime: "1765318120",
          orderType: 2,
          zone: "0x000056f7000000ece9003ca63978907a00ffd100",
          zoneHash:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          salt: "0x3d958fe20000000000000000000000000000000000000000aed879ed15914a7b",
          conduitKey:
            "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
          totalOriginalConsiderationItems: 2,
          counter: 0,
        },
        signature: null,
      } as unknown as ProtocolData,
      protocol_address: "0x0000000000000068f116a894984e2db1123eb395",
      price: {
        currency: "WETH",
        decimals: 18,
        value: "5480000000000000000",
      },
      criteria: {
        collection: { slug: "boredapeyachtclub" },
        contract: { address: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d" },
      },
      status: OrderStatus.ACTIVE,
    }

    mockGet.mockResolvedValue({ order: mockOffer })

    const result = await ordersAPI.getOrderByHash(
      "0x143be64aaf5d170c61e56ceb37dff0f8494e2630a7eae3eb24c8edbef09af9d5",
      "0x0000000000000068f116a894984e2db1123eb395",
    )

    expect(mockGet).toHaveBeenCalledTimes(1)
    expect(mockGet.mock.calls[0][0]).toBe(
      "/api/v2/orders/chain/ethereum/protocol/0x0000000000000068f116a894984e2db1123eb395/0x143be64aaf5d170c61e56ceb37dff0f8494e2630a7eae3eb24c8edbef09af9d5",
    )

    // Verify it returns the raw API response (Offer type)
    expect(result.order_hash).toBe(
      "0x143be64aaf5d170c61e56ceb37dff0f8494e2630a7eae3eb24c8edbef09af9d5",
    )
    expect(result.protocol_address).toBe(
      "0x0000000000000068f116a894984e2db1123eb395",
    )
    expect(result.protocol_data.parameters.offerer).toBe(
      "0xaf68f720d7e51b88a76ec35aab2b1694f8f0892a",
    )
    expect((result as Offer).criteria?.collection.slug).toBe(
      "boredapeyachtclub",
    )
  })

  test("returns a Listing type response", async () => {
    const mockListing: Listing = {
      order_hash:
        "0xabc123def456789012345678901234567890123456789012345678901234abcd",
      chain: "ethereum",
      protocol_data: {
        parameters: {
          offerer: "0x1234567890123456789012345678901234567890",
          offer: [
            {
              itemType: 2,
              token: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
              identifierOrCriteria: "1234",
              startAmount: "1",
              endAmount: "1",
            },
          ],
          consideration: [],
          startTime: "1765058920",
          endTime: "1765318120",
          orderType: 0,
          zone: "0x000056f7000000ece9003ca63978907a00ffd100",
          zoneHash:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          salt: "0x1234",
          conduitKey:
            "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
          totalOriginalConsiderationItems: 1,
          counter: 0,
        },
        signature: "0xsignature",
      } as unknown as ProtocolData,
      protocol_address: "0x0000000000000068f116a894984e2db1123eb395",
      type: OrderType.BASIC,
      price: {
        current: {
          currency: "ETH",
          decimals: 18,
          value: "1000000000000000000",
        },
      },
      remaining_quantity: 1,
      status: OrderStatus.ACTIVE,
    }

    mockGet.mockResolvedValue({ order: mockListing })

    const result = await ordersAPI.getOrderByHash(
      "0xabc123def456789012345678901234567890123456789012345678901234abcd",
      "0x0000000000000068f116a894984e2db1123eb395",
    )

    // Verify it returns the raw API response (Listing type)
    expect(result.order_hash).toBe(
      "0xabc123def456789012345678901234567890123456789012345678901234abcd",
    )
    expect(result.protocol_address).toBe(
      "0x0000000000000068f116a894984e2db1123eb395",
    )
    expect((result as Listing).remaining_quantity).toBe(1)
    expect((result as Listing).type).toBe(OrderType.BASIC)
  })

  test("response can be used for order cancellation", async () => {
    const mockOffer: Offer = {
      order_hash: "0x123",
      chain: "ethereum",
      protocol_data: {
        parameters: {
          offerer: "0xofferer",
          offer: [],
          consideration: [],
          startTime: "0",
          endTime: "0",
          orderType: 0,
          zone: "0x0",
          zoneHash: "0x0",
          salt: "0",
          conduitKey: "0x0",
          totalOriginalConsiderationItems: 0,
          counter: 0,
        },
        signature: null,
      } as unknown as ProtocolData,
      protocol_address: "0xprotocol",
      price: {
        currency: "ETH",
        decimals: 18,
        value: "1000000000000000000",
      },
      status: OrderStatus.ACTIVE,
    }

    mockGet.mockResolvedValue({ order: mockOffer })

    const result: GetOrderByHashResponse = await ordersAPI.getOrderByHash(
      "0x123",
      "0xprotocol",
    )

    // Verify the response has the fields needed for cancellation
    expect(result.protocol_address).toBe("0xprotocol")
    expect(result.protocol_data).toBeDefined()
    expect(result.protocol_data.parameters).toBeDefined()
    expect(result.protocol_data.parameters.offerer).toBe("0xofferer")
  })

  test("passes chain parameter correctly", async () => {
    // Create a new API instance for this test with Polygon chain
    const { fetcher, mockGet: polygonMockGet } = createMockFetcher()
    const polygonOrdersAPI = new OrdersAPI(fetcher, Chain.Polygon)

    const mockOffer: Offer = {
      order_hash: "0x123",
      chain: "polygon",
      protocol_data: {
        parameters: {
          offerer: "0x1",
          offer: [],
          consideration: [],
          startTime: "0",
          endTime: "0",
          orderType: 0,
          zone: "0x0",
          zoneHash: "0x0",
          salt: "0",
          conduitKey: "0x0",
          totalOriginalConsiderationItems: 0,
          counter: 0,
        },
        signature: null,
      } as unknown as ProtocolData,
      protocol_address: "0xprotocol",
      price: {
        currency: "ETH",
        decimals: 18,
        value: "1000000000000000000",
      },
      status: OrderStatus.ACTIVE,
    }

    polygonMockGet.mockResolvedValue({ order: mockOffer })

    await polygonOrdersAPI.getOrderByHash("0x123", "0xprotocol")

    expect(polygonMockGet.mock.calls[0][0]).toContain("/chain/polygon/")
  })
})
