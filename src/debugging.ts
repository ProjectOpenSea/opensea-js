import { Order } from "./types"
import { NULL_ADDRESS } from "./utils"

export const MAX_ERROR_LENGTH = 120

/**
 * This file reproduces Solidity methods to make debugging easier
 */

enum Side { Buy, Sell }

enum SaleKind { FixedPrice, DutchAuction }

const SaleKindInterface = {
  Side,
  SaleKind,

  validateParameters(saleKind: SaleKind, expirationTime: number): boolean {
    return (saleKind === SaleKind.FixedPrice || expirationTime > 0)
  },

  canSettleOrder(listingTime: number, expirationTime: number): boolean {
    const now = Math.round(Date.now() / 1000)
    return (listingTime < now) && (expirationTime === 0 || now < expirationTime)
  }
}

/**
 * Debug the `ordersCanMatch` part of Wyvern
 * @param buy Buy order for debugging
 * @param sell Sell order for debugging
 */
export async function debugOrdersCanMatch(buy: Order, sell: Order) {
  if (!(+buy.side == +SaleKindInterface.Side.Buy && +sell.side == +SaleKindInterface.Side.Sell)) {
    throw new Error('Must be opposite-side')
  }

  if (!(buy.feeMethod == sell.feeMethod)) {
    throw new Error('Must use same fee method')
  }

  if (!(buy.paymentToken == sell.paymentToken)) {
    throw new Error('Must use same payment token')
  }

  if (!(sell.taker == NULL_ADDRESS || sell.taker == buy.maker)) {
    throw new Error('Sell taker must be null or matching buy maker')
  }

  if (!(buy.taker == NULL_ADDRESS || buy.taker == sell.maker)) {
    throw new Error('Buy taker must be null or matching sell maker')
  }

  if (!((sell.feeRecipient == NULL_ADDRESS && buy.feeRecipient != NULL_ADDRESS) || (sell.feeRecipient != NULL_ADDRESS && buy.feeRecipient == NULL_ADDRESS))) {
    throw new Error('One order must be maker and the other must be taker')
  }

  if (!(buy.target == sell.target)) {
    throw new Error('Must match target')
  }

  if (!(buy.howToCall == sell.howToCall)) {
    throw new Error('Must match howToCall')
  }

  if (!SaleKindInterface.canSettleOrder(+buy.listingTime, +buy.expirationTime)) {
    throw new Error(`Buy-side order is set in the future or expired`)
  }

  if (!SaleKindInterface.canSettleOrder(+sell.listingTime, +sell.expirationTime)) {
    throw new Error(`Sell-side order is set in the future or expired`)
  }

  // Handle default
  throw new Error('Unable to match offer with auction')
}

/**
 * Debug the `orderCalldataCanMatch` part of Wyvern
 * @param buy Buy order for debugging
 * @param sell Sell Order for debugging
 */
export async function debugOrderCalldataCanMatch(buy: Order, sell: Order) {
  throw new Error('Unable to match offer data with auction data.')
}
