import { OrderProtocol } from "../orders/types";
import { Chain, OrderSide } from "../types";

export const getOrdersAPIPath = (
  chain: Chain,
  protocol: OrderProtocol,
  side: OrderSide,
) => {
  const sidePath = side === OrderSide.LISTING ? "listings" : "offers";
  return `/api/v2/orders/${chain}/${protocol}/${sidePath}`;
};

export const getAllOffersAPIPath = (collectionSlug: string) => {
  return `/api/v2/offers/collection/${collectionSlug}/all`;
};

export const getAllListingsAPIPath = (collectionSlug: string) => {
  return `/api/v2/listings/collection/${collectionSlug}/all`;
};

export const getBestOfferAPIPath = (
  collectionSlug: string,
  tokenId: string | number,
) => {
  return `/api/v2/offers/collection/${collectionSlug}/nfts/${tokenId}/best`;
};

export const getBestListingAPIPath = (
  collectionSlug: string,
  tokenId: string | number,
) => {
  return `/api/v2/listings/collection/${collectionSlug}/nfts/${tokenId}/best`;
};

export const getBestListingsAPIPath = (collectionSlug: string) => {
  return `/api/v2/listings/collection/${collectionSlug}/best`;
};

export const getCollectionPath = (slug: string) => {
  return `/api/v2/collections/${slug}`;
};

export const getCollectionsPath = () => {
  return "/api/v2/collections";
};

export const getCollectionStatsPath = (slug: string) => {
  return `/api/v2/collections/${slug}/stats`;
};

export const getPaymentTokenPath = (chain: Chain, address: string) => {
  return `/api/v2/chain/${chain}/payment_token/${address}`;
};

export const getAccountPath = (address: string) => {
  return `/api/v2/accounts/${address}`;
};

export const getBuildOfferPath = () => {
  return `/api/v2/offers/build`;
};

export const getPostCollectionOfferPath = () => {
  return `/api/v2/offers`;
};

export const getCollectionOffersPath = (slug: string) => {
  return `/api/v2/offers/collection/${slug}`;
};

export const getListNFTsByCollectionPath = (slug: string) => {
  return `/api/v2/collection/${slug}/nfts`;
};

export const getListNFTsByContractPath = (chain: Chain, address: string) => {
  return `/api/v2/chain/${chain}/contract/${address}/nfts`;
};

export const getListNFTsByAccountPath = (chain: Chain, address: string) => {
  return `/api/v2/chain/${chain}/account/${address}/nfts`;
};

export const getNFTPath = (
  chain: Chain,
  address: string,
  identifier: string,
) => {
  return `/api/v2/chain/${chain}/contract/${address}/nfts/${identifier}`;
};

export const getRefreshMetadataPath = (
  chain: Chain,
  address: string,
  identifier: string,
) => {
  return `/api/v2/chain/${chain}/contract/${address}/nfts/${identifier}/refresh`;
};

export const getCancelOrderPath = (
  chain: Chain,
  protocolAddress: string,
  orderHash: string,
) => {
  return `/api/v2/orders/chain/${chain}/protocol/${protocolAddress}/${orderHash}/cancel`;
};

export const getTraitOffersPath = (collectionSlug: string) => {
  return `/api/v2/offers/collection/${collectionSlug}/traits`;
};
