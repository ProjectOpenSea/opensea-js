import { Network } from "../types";
import { OrderProtocol, OrdersQueryOptions, OrderSide } from "./types";

const NETWORK_TO_CHAIN = {
  [Network.Main]: "ethereum",
  [Network.Rinkeby]: "rinkeby",
};

export const getOrdersAPIPath = (
  network: Network,
  protocol: OrderProtocol,
  side: OrderSide
) => {
  const chain = NETWORK_TO_CHAIN[network];
  const sidePath = side === "ask" ? "listings" : "offers";
  return `/api/v2/orders/${chain}/${protocol}/${sidePath}`;
};

type OrdersQueryPathOptions = "protocol" | "side";
export const serializeOrdersQueryOptions = (
  options: Omit<OrdersQueryOptions, OrdersQueryPathOptions>
) => {
  return {
    limit: options.limit,
    cursor: options.cursor,

    payment_token_address: options.paymentTokenAddress,
    maker: options.maker,
    taker: options.taker,
    owner: options.owner,
    bundled: options.bundled,
    include_bundled: options.includeBundled,
    listed_after: options.listedAfter,
    listed_before: options.listedBefore,
    token_ids: options.tokenIds,
    asset_contract_address: options.assetContractAddress,
    order_by: options.orderBy,
    order_direction: options.orderDirection,
    only_english: options.onlyEnglish,
  };
};
