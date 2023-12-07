import { OrderProtocol } from "../orders/types";
import { Chain, OrderSide } from "../types";

export const getOrdersAPIPath = (
  chain: Chain,
  protocol: OrderProtocol,
  side: OrderSide,
) => {
  const sidePath = side === OrderSide.ASK ? "listings" : "offers";
  return `/v2/orders/${chain}/${protocol}/${sidePath}`;
};

export const getAllOffersAPIPath = (collectionSlug: string) => {
  return `/v2/offers/collection/${collectionSlug}/all`;
};

export const getAllListingsAPIPath = (collectionSlug: string) => {
  return `/v2/listings/collection/${collectionSlug}/all`;
};

export const getBestOfferAPIPath = (
  collectionSlug: string,
  tokenId: string | number,
) => {
  return `/v2/offers/collection/${collectionSlug}/nfts/${tokenId}/best`;
};

export const getBestListingAPIPath = (
  collectionSlug: string,
  tokenId: string | number,
) => {
  return `/v2/listings/collection/${collectionSlug}/nfts/${tokenId}/best`;
};

export const getBestListingsAPIPath = (collectionSlug: string) => {
  return `/v2/listings/collection/${collectionSlug}/best`;
};

export const getCollectionPath = (slug: string) => {
  return `/api/v2/collections/${slug}`;
};

export const getCollectionStatsPath = (slug: string) => {
  return `/api/v2/collections/${slug}/stats`;
};

export const getPaymentTokenPath = (chain: Chain, address: string) => {
  return `/v2/chain/${chain}/payment_token/${address}`;
};

export const getAccountPath = (address: string) => {
  return `/v2/accounts/${address}`;
};

export const getBuildOfferPath = () => {
  return `/v2/offers/build`;
};

export const getPostCollectionOfferPath = () => {
  return `/v2/offers`;
};

export const getCollectionOffersPath = (slug: string) => {
  return `/v2/offers/collection/${slug}`;
};

export const getListNFTsByCollectionPath = (slug: string) => {
  return `/v2/collection/${slug}/nfts`;
};

export const getListNFTsByContractPath = (chain: Chain, address: string) => {
  return `/v2/chain/${chain}/contract/${address}/nfts`;
};

export const getListNFTsByAccountPath = (chain: Chain, address: string) => {
  return `/v2/chain/${chain}/account/${address}/nfts`;
};

export const getNFTPath = (
  chain: Chain,
  address: string,
  identifier: string,
) => {
  return `/v2/chain/${chain}/contract/${address}/nfts/${identifier}`;
};

export const getRefreshMetadataPath = (
  chain: Chain,
  address: string,
  identifier: string,
) => {
  return `/v2/chain/${chain}/contract/${address}/nfts/${identifier}/refresh`;
};
