import { getDropMintPath, getDropPath, getDropsPath } from "./apiPaths"
import type { Fetcher } from "./fetcher"
import type {
  DropMintRequest,
  DropMintResponse,
  GetDropResponse,
  GetDropsArgs,
  GetDropsResponse,
} from "./types"

/**
 * Drop-related API operations
 */
export class DropsAPI {
  constructor(private fetcher: Fetcher) {}

  /**
   * Gets a list of drops (mints).
   */
  async getDrops(args?: GetDropsArgs): Promise<GetDropsResponse> {
    const response = await this.fetcher.get<GetDropsResponse>(getDropsPath(), {
      ...args,
      chains: args?.chains?.join(","),
    })
    return response
  }

  /**
   * Gets detailed drop information for a collection.
   */
  async getDrop(slug: string): Promise<GetDropResponse> {
    const response = await this.fetcher.get<GetDropResponse>(getDropPath(slug))
    return response
  }

  /**
   * Builds a mint transaction for a drop.
   */
  async buildMintTransaction(
    slug: string,
    request: DropMintRequest,
  ): Promise<DropMintResponse> {
    const response = await this.fetcher.post<DropMintResponse>(
      getDropMintPath(slug),
      request,
    )
    return response
  }
}
