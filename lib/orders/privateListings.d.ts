import { ConsiderationInputItem, CreateInputItem, MatchOrdersFulfillment, Order, OrderWithCounter } from "@opensea/seaport-js/lib/types";
export declare const getPrivateListingConsiderations: (offer: CreateInputItem[], privateSaleRecipient: string) => ConsiderationInputItem[];
export declare const constructPrivateListingCounterOrder: (order: OrderWithCounter, privateSaleRecipient: string) => Order;
export declare const getPrivateListingFulfillments: (privateListingOrder: OrderWithCounter) => MatchOrdersFulfillment[];
