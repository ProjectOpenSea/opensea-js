import { Order } from "./types";
export declare const MAX_ERROR_LENGTH = 120;
/**
 * Debug the `ordersCanMatch` part of Wyvern
 * @param buy Buy order for debugging
 * @param sell Sell order for debugging
 */
export declare function debugOrdersCanMatch(buy: Order, sell: Order): Promise<void>;
/**
 * Debug the `orderCalldataCanMatch` part of Wyvern
 * @param buy Buy order for debugging
 * @param sell Sell Order for debugging
 */
export declare function debugOrderCalldataCanMatch(buy: Order, sell: Order): Promise<void>;
