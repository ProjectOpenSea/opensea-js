import { OrderProtocol, OrdersQueryOptions, OrderSide, OrderV2, SerializedOrderV2, ProtocolData } from "./types";
import { Network } from "../types";
export declare const DEFAULT_SEAPORT_CONTRACT_ADDRESS = "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC";
export declare const getOrdersAPIPath: (network: Network, protocol: OrderProtocol, side: OrderSide) => string;
export declare const getCollectionPath: (slug: string) => string;
export declare const getBuildOfferPath: () => string;
export declare const getPostCollectionOfferPath: () => string;
export declare const getPostCollectionOfferPayload: (collectionSlug: string, protocol_data: ProtocolData) => {
    criteria: {
        collection: {
            slug: string;
        };
    };
    protocol_data: import("@opensea/seaport-js/lib/types").OrderWithCounter;
    protocol_address: string;
};
export declare const getBuildCollectionOfferPayload: (offererAddress: string, quantity: number, collectionSlug: string) => {
    offerer: string;
    quantity: number;
    criteria: {
        collection: {
            slug: string;
        };
    };
    protocol_address: string;
};
export declare const getFulfillmentDataPath: (side: OrderSide) => string;
export declare const getFulfillListingPayload: (fulfillerAddress: string, order_hash: string, protocolAddress: string, network: Network) => {
    listing: {
        hash: string;
        chain: string;
        protocol_address: string;
    };
    fulfiller: {
        address: string;
    };
};
export declare const getFulfillOfferPayload: (fulfillerAddress: string, order_hash: string, protocolAddress: string, network: Network) => {
    offer: {
        hash: string;
        chain: string;
        protocol_address: string;
    };
    fulfiller: {
        address: string;
    };
};
type OrdersQueryPathOptions = "protocol" | "side";
export declare const serializeOrdersQueryOptions: (options: Omit<OrdersQueryOptions, OrdersQueryPathOptions>) => {
    limit: number;
    cursor: string | undefined;
    payment_token_address: string | undefined;
    maker: string | undefined;
    taker: string | undefined;
    owner: string | undefined;
    bundled: boolean | undefined;
    include_bundled: boolean | undefined;
    listed_after: string | number | undefined;
    listed_before: string | number | undefined;
    token_ids: (string | undefined)[];
    asset_contract_address: string | undefined;
    order_by: ("created_date" | "eth_price") | undefined;
    order_direction: ("asc" | "desc") | undefined;
    only_english: boolean | undefined;
};
export declare const deserializeOrder: (order: SerializedOrderV2) => OrderV2;
export {};
