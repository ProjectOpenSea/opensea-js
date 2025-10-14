import {
  getListNFTsByCollectionPath,
  getListNFTsByContractPath,
  getNFTPath,
  getRefreshMetadataPath,
  getListNFTsByAccountPath,
} from "./apiPaths";
import {
  ListNFTsResponse,
  GetNFTResponse,
} from "./types";
import { Chain } from "../types";

/**
 * NFT-related API operations
 */
export class NFTsAPI {
  constructor(
    private get: <T>(apiPath: string, query?: object) => Promise<T>,
    private post: <T>(apiPath: string, body?: object, opts?: object) => Promise<T>,
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
    const response = await this.get<ListNFTsResponse>(
      getListNFTsByCollectionPath(slug),
      {
        limit,
        next,
      },
    );
    return response;
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
    const response = await this.get<ListNFTsResponse>(
      getListNFTsByContractPath(chain, address),
      {
        limit,
        next,
      },
    );
    return response;
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
    const response = await this.get<ListNFTsResponse>(
      getListNFTsByAccountPath(chain, address),
      {
        limit,
        next,
      },
    );

    return response;
  }

  /**
   * Fetch metadata, traits, ownership information, and rarity for a single NFT.
   */
  async getNFT(
    address: string,
    identifier: string,
    chain = this.chain,
  ): Promise<GetNFTResponse> {
    const response = await this.get<GetNFTResponse>(
      getNFTPath(chain, address, identifier),
    );
    return response;
  }

  /**
   * Force refresh the metadata for an NFT.
   */
  async refreshNFTMetadata(
    address: string,
    identifier: string,
    chain: Chain = this.chain,
  ): Promise<Response> {
    const response = await this.post<Response>(
      getRefreshMetadataPath(chain, address, identifier),
      {},
    );

    return response;
  }
}
