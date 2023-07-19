import { ConsiderationItem } from "@opensea/seaport-js/lib/types";
import { ProtocolData } from "src/orders/types";

export type BuildOfferResponse = {
  partialParameters: PartialParameters;
};

type PartialParameters = {
  consideration: ConsiderationItem[];
  zone: string;
  zoneHash: string;
};

type Criteria = {
  collection: CollectionCriteria;
  contract?: ContractCriteria;
  encoded_token_ids?: string;
};

type CollectionCriteria = {
  slug: string;
};

type ContractCriteria = {
  address: string;
};

export type GetCollectionResponse = {
  collection: object;
};

export type Offer = {
  order_hash: string;
  chain: string;
  criteria: Criteria;
  protocol_data: ProtocolData;
  protocol_address: string;
};

export type ListCollectionOffersResponse = {
  offers: Offer[];
};

export type ListNFTsResponse = {
  nfts: NFT[];
  next: string;
};

export type GetNFTResponse = {
  nft: NFT;
};

export type NFT = {
  identifier: string;
  collection: string;
  contract: string;
  token_standard: string;
  name: string;
  description: string;
  image_url: string;
  metadata_url: string;
  created_at: string;
  updated_at: string;
  is_disabled: boolean;
  is_nsfw: boolean;
};
