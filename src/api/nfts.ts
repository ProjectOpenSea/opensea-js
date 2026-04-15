import type { Chain, OpenSeaCollection } from "../types"
import { collectionFromJSON } from "../utils/converters"
import {
  getContractPath,
  getListNFTsByAccountPath,
  getListNFTsByCollectionPath,
  getListNFTsByContractPath,
  getNFTCollectionPath,
  getNFTMetadataPath,
  getNFTPath,
  getRefreshMetadataPath,
  getValidateMetadataPath,
} from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type {
  GetCollectionResponse,
  GetContractResponse,
  GetNFTMetadataResponse,
  GetNFTResponse,
  ListNFTsResponse,
  ValidateMetadataResponse,
} from "./types"

/**
 * NFT-related API operations
 */
export class NFTsAPI {
  constructor(
    private fetcher: Fetcher,
    private chain: Chain,
  ) {}

  /**
   * Fetch multiple NFTs for a collection.
   */
  async getNFTsByCollection(
    slug: string,
    limit: number | undefined = undefined,
    next: string | undefined = undefined,
  ): Promise<ListNFTsResponse> {
    const response = await this.fetcher.get<ListNFTsResponse>(
      getListNFTsByCollectionPath(slug),
      {
        limit,
        next,
      },
    )
    return response
  }

  /**
   * Fetch multiple NFTs for a contract.
   */
  async getNFTsByContract(
    address: string,
    limit: number | undefined = undefined,
    next: string | undefined = undefined,
    chain: Chain = this.chain,
  ): Promise<ListNFTsResponse> {
    const response = await this.fetcher.get<ListNFTsResponse>(
      getListNFTsByContractPath(chain, address),
      {
        limit,
        next,
      },
    )
    return response
  }

  /**
   * Fetch NFTs owned by an account.
   */
  async getNFTsByAccount(
    address: string,
    limit: number | undefined = undefined,
    next: string | undefined = undefined,
    chain = this.chain,
  ): Promise<ListNFTsResponse> {
    const response = await this.fetcher.get<ListNFTsResponse>(
      getListNFTsByAccountPath(chain, address),
      {
        limit,
        next,
      },
    )

    return response
  }

  /**
   * Fetch metadata, traits, ownership information, and rarity for a single NFT.
   */
  async getNFT(
    address: string,
    identifier: string,
    chain = this.chain,
  ): Promise<GetNFTResponse> {
    const response = await this.fetcher.get<GetNFTResponse>(
      getNFTPath(chain, address, identifier),
    )
    return response
  }

  /**
   * Force refresh the metadata for an NFT.
   */
  async refreshNFTMetadata(
    address: string,
    identifier: string,
    chain: Chain = this.chain,
  ): Promise<Response> {
    const response = await this.fetcher.post<Response>(
      getRefreshMetadataPath(chain, address, identifier),
      {},
    )

    return response
  }

  /**
   * Fetch smart contract information for a given chain and address.
   */
  async getContract(
    address: string,
    chain: Chain = this.chain,
  ): Promise<GetContractResponse> {
    const response = await this.fetcher.get<GetContractResponse>(
      getContractPath(chain, address),
    )
    return response
  }

  /**
   * Validate NFT metadata by fetching and parsing it.
   */
  async validateMetadata(
    address: string,
    identifier: string,
    chain: Chain = this.chain,
    ignoreCachedItemUrls?: boolean,
  ): Promise<ValidateMetadataResponse> {
    let path = getValidateMetadataPath(chain, address, identifier)
    if (ignoreCachedItemUrls !== undefined) {
      path += `?ignoreCachedItemUrls=${ignoreCachedItemUrls}`
    }
    const response = await this.fetcher.post<ValidateMetadataResponse>(path)
    return response
  }

  /**
   * Get the collection that an NFT belongs to.
   * Useful for multi-contract collections where the token ID disambiguates
   * which collection the NFT belongs to.
   */
  async getNFTCollection(
    address: string,
    identifier: string,
    chain: Chain = this.chain,
  ): Promise<OpenSeaCollection> {
    const response = await this.fetcher.get<GetCollectionResponse>(
      getNFTCollectionPath(chain, address, identifier),
    )
    return collectionFromJSON(response)
  }

  /**
   * Get detailed metadata for an NFT including name, description, image, traits,
   * and external links.
   */
  async getNFTMetadata(
    address: string,
    tokenId: string,
    chain: Chain = this.chain,
  ): Promise<GetNFTMetadataResponse> {
    const response = await this.fetcher.get<GetNFTMetadataResponse>(
      getNFTMetadataPath(chain, address, tokenId),
    )
    return response
  }
}
