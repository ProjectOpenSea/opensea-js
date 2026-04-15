import type { OrderProtocol } from "../orders/types"
import { type Chain, OrderSide } from "../types"

/** Base path prefix for all OpenSea API v2 endpoints. */
export const API_V2_PREFIX = "/api/v2"

export const getOrdersAPIPath = (
  chain: Chain,
  protocol: OrderProtocol,
  side: OrderSide,
) => {
  const sidePath = side === OrderSide.LISTING ? "listings" : "offers"
  return `${API_V2_PREFIX}/orders/${chain}/${protocol}/${sidePath}`
}

export const getAllOffersAPIPath = (collectionSlug: string) => {
  return `${API_V2_PREFIX}/offers/collection/${collectionSlug}/all`
}

export const getAllListingsAPIPath = (collectionSlug: string) => {
  return `${API_V2_PREFIX}/listings/collection/${collectionSlug}/all`
}

export const getBestOfferAPIPath = (
  collectionSlug: string,
  tokenId: string | number,
) => {
  return `${API_V2_PREFIX}/offers/collection/${collectionSlug}/nfts/${tokenId}/best`
}

export const getBestListingAPIPath = (
  collectionSlug: string,
  tokenId: string | number,
) => {
  return `${API_V2_PREFIX}/listings/collection/${collectionSlug}/nfts/${tokenId}/best`
}

export const getBestListingsAPIPath = (collectionSlug: string) => {
  return `${API_V2_PREFIX}/listings/collection/${collectionSlug}/best`
}

export const getCollectionPath = (slug: string) => {
  return `${API_V2_PREFIX}/collections/${slug}`
}

export const getCollectionsPath = () => {
  return `${API_V2_PREFIX}/collections`
}

export const getCollectionStatsPath = (slug: string) => {
  return `${API_V2_PREFIX}/collections/${slug}/stats`
}

export const getPaymentTokenPath = (chain: Chain, address: string) => {
  return `${API_V2_PREFIX}/chain/${chain}/payment_token/${address}`
}

export const getAccountPath = (address: string) => {
  return `${API_V2_PREFIX}/accounts/${address}`
}

export const getBuildOfferPath = () => {
  return `${API_V2_PREFIX}/offers/build`
}

export const getPostCollectionOfferPath = () => {
  return `${API_V2_PREFIX}/offers`
}

export const getCollectionOffersPath = (slug: string) => {
  return `${API_V2_PREFIX}/offers/collection/${slug}`
}

export const getListNFTsByCollectionPath = (slug: string) => {
  return `${API_V2_PREFIX}/collection/${slug}/nfts`
}

export const getListNFTsByContractPath = (chain: Chain, address: string) => {
  return `${API_V2_PREFIX}/chain/${chain}/contract/${address}/nfts`
}

export const getListNFTsByAccountPath = (chain: Chain, address: string) => {
  return `${API_V2_PREFIX}/chain/${chain}/account/${address}/nfts`
}

export const getNFTPath = (
  chain: Chain,
  address: string,
  identifier: string,
) => {
  return `${API_V2_PREFIX}/chain/${chain}/contract/${address}/nfts/${identifier}`
}

export const getRefreshMetadataPath = (
  chain: Chain,
  address: string,
  identifier: string,
) => {
  return `${API_V2_PREFIX}/chain/${chain}/contract/${address}/nfts/${identifier}/refresh`
}

export const getOrderByHashPath = (
  chain: Chain,
  protocolAddress: string,
  orderHash: string,
) => {
  return `${API_V2_PREFIX}/orders/chain/${chain}/protocol/${protocolAddress}/${orderHash}`
}

export const getCancelOrderPath = (
  chain: Chain,
  protocolAddress: string,
  orderHash: string,
) => {
  return `${API_V2_PREFIX}/orders/chain/${chain}/protocol/${protocolAddress}/${orderHash}/cancel`
}

export const getTraitOffersPath = (collectionSlug: string) => {
  return `${API_V2_PREFIX}/offers/collection/${collectionSlug}/traits`
}

export const getEventsAPIPath = () => {
  return `${API_V2_PREFIX}/events`
}

export const getEventsByAccountAPIPath = (address: string) => {
  return `${API_V2_PREFIX}/events/accounts/${address}`
}

export const getEventsByCollectionAPIPath = (collectionSlug: string) => {
  return `${API_V2_PREFIX}/events/collection/${collectionSlug}`
}

export const getEventsByNFTAPIPath = (
  chain: Chain,
  address: string,
  identifier: string,
) => {
  return `${API_V2_PREFIX}/events/chain/${chain}/contract/${address}/nfts/${identifier}`
}

export const getContractPath = (chain: Chain, address: string) => {
  return `${API_V2_PREFIX}/chain/${chain}/contract/${address}`
}

export const getTraitsPath = (collectionSlug: string) => {
  return `${API_V2_PREFIX}/traits/${collectionSlug}`
}

export const getTrendingTokensPath = () => {
  return `${API_V2_PREFIX}/tokens/trending`
}

export const getTopTokensPath = () => {
  return `${API_V2_PREFIX}/tokens/top`
}

export const getSwapQuotePath = () => {
  return `${API_V2_PREFIX}/swap/quote`
}

export const getTokenPath = (chain: string, address: string) => {
  return `${API_V2_PREFIX}/chain/${chain}/token/${address}`
}

export const getSearchPath = () => {
  return `${API_V2_PREFIX}/search`
}

export const getChainsPath = () => {
  return `${API_V2_PREFIX}/chains`
}

export const getAccountTokensPath = (address: string) => {
  return `${API_V2_PREFIX}/account/${address}/tokens`
}

export const getValidateMetadataPath = (
  chain: Chain,
  address: string,
  identifier: string,
) => {
  return `${API_V2_PREFIX}/chain/${chain}/contract/${address}/nfts/${identifier}/validate-metadata`
}

export const getDropsPath = () => {
  return `${API_V2_PREFIX}/drops`
}

export const getDropPath = (slug: string) => {
  return `${API_V2_PREFIX}/drops/${slug}`
}

export const getDropMintPath = (slug: string) => {
  return `${API_V2_PREFIX}/drops/${slug}/mint`
}

export const getTrendingCollectionsPath = () => {
  return `${API_V2_PREFIX}/collections/trending`
}

export const getTopCollectionsPath = () => {
  return `${API_V2_PREFIX}/collections/top`
}

export const getResolveAccountPath = (identifier: string) => {
  return `${API_V2_PREFIX}/accounts/resolve/${identifier}`
}

export const getNFTCollectionPath = (
  chain: Chain,
  address: string,
  identifier: string,
) => {
  return `${API_V2_PREFIX}/chain/${chain}/contract/${address}/nfts/${identifier}/collection`
}

export const getNFTMetadataPath = (
  chain: Chain,
  contractAddress: string,
  tokenId: string,
) => {
  return `${API_V2_PREFIX}/metadata/${chain}/${contractAddress}/${tokenId}`
}
