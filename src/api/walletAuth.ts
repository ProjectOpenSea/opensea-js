import type {
  OperationQueryParams,
  OperationRequestBody,
  OperationResponse,
  operations,
} from "@opensea/api-types"
import type { Camelize } from "../utils/case"
import type { WalletAuthFetcher } from "./fetcher"

type OperationName = keyof operations
export type WalletAuthRequest<T extends OperationName> = Camelize<
  OperationRequestBody<T>
>
export type WalletAuthResponse<T extends OperationName> = Camelize<
  OperationResponse<T>
>
export type WalletAuthQuery<T extends OperationName> = Camelize<
  OperationQueryParams<T>
>

const segment = (value: string | number) => encodeURIComponent(String(value))

/** Typed helpers for wallet-authenticated REST operations. */
export class WalletAuthAPI {
  constructor(private fetcher: WalletAuthFetcher) {}

  getDropEligibility(slug: string) {
    return this.fetcher.get<OperationResponse<"get_drop_eligibility">>(
      `/api/v2/drops/${segment(slug)}/eligibility`,
    )
  }

  getFavorites(
    address: string,
    query?: WalletAuthQuery<"get_profile_favorites">,
  ) {
    return this.fetcher.get<OperationResponse<"get_profile_favorites">>(
      `/api/v2/account/${segment(address)}/favorites`,
      query,
    )
  }

  getTokenWatchlist(address: string) {
    return this.fetcher.get<OperationResponse<"get_account_token_watchlist">>(
      `/api/v2/account/${segment(address)}/token_watchlist`,
    )
  }

  getPerpetualWatchlist(address: string) {
    return this.fetcher.get<
      OperationResponse<"get_account_perpetual_watchlist">
    >(`/api/v2/account/${segment(address)}/perpetual_watchlist`)
  }

  addWatchlistEntry(body: WalletAuthRequest<"add_watchlist_entry">) {
    return this.fetcher.request<OperationResponse<"add_watchlist_entry">>(
      "POST",
      "/api/v2/watchlist",
      body,
    )
  }

  removeWatchlistEntry(body: WalletAuthRequest<"remove_watchlist_entry">) {
    return this.fetcher.request<OperationResponse<"remove_watchlist_entry">>(
      "DELETE",
      "/api/v2/watchlist",
      body,
    )
  }

  cancelOrder(
    chain: string,
    protocolAddress: string,
    orderHash: string,
    body: WalletAuthRequest<"cancel_order">,
  ) {
    return this.fetcher.request<OperationResponse<"cancel_order">>(
      "POST",
      `/api/v2/orders/chain/${segment(chain)}/protocol/${segment(protocolAddress)}/${segment(orderHash)}/cancel`,
      body,
    )
  }

  saveDropEdits(slug: string, body: WalletAuthRequest<"save_drop_edits">) {
    return this.fetcher.request<OperationResponse<"save_drop_edits">>(
      "POST",
      `/api/v2/drops/${segment(slug)}`,
      body,
    )
  }

  savePrerevealDropItem(
    slug: string,
    body: WalletAuthRequest<"save_prereveal_drop_item">,
  ) {
    return this.fetcher.request<OperationResponse<"save_prereveal_drop_item">>(
      "POST",
      `/api/v2/drops/${segment(slug)}/prereveal-item`,
      body,
    )
  }

  saveSelfMintDropItem(
    slug: string,
    body: WalletAuthRequest<"save_self_mint_drop_item">,
  ) {
    return this.fetcher.request<OperationResponse<"save_self_mint_drop_item">>(
      "POST",
      `/api/v2/drops/${segment(slug)}/items`,
      body,
    )
  }

  updateSelfMintDropItem(
    slug: string,
    tokenId: string | number,
    body: WalletAuthRequest<"update_self_mint_drop_item">,
  ) {
    return this.fetcher.request<
      OperationResponse<"update_self_mint_drop_item">
    >("PUT", `/api/v2/drops/${segment(slug)}/items/${segment(tokenId)}`, body)
  }

  updateDropItem(
    slug: string,
    tokenId: string | number,
    body: WalletAuthRequest<"update_drop_item">,
  ) {
    return this.fetcher.request<OperationResponse<"update_drop_item">>(
      "PATCH",
      `/api/v2/drops/${segment(slug)}/items/${segment(tokenId)}`,
      body,
    )
  }

  createDropItemMediaUpload(
    slug: string,
    body: WalletAuthRequest<"upload_drop_item_media">,
  ) {
    return this.fetcher.request<OperationResponse<"upload_drop_item_media">>(
      "POST",
      `/api/v2/drops/${segment(slug)}/items/media`,
      body,
    )
  }

  saveDropItemMedia(
    slug: string,
    body: WalletAuthRequest<"save_drop_item_media">,
  ) {
    return this.fetcher.request<OperationResponse<"save_drop_item_media">>(
      "POST",
      `/api/v2/drops/${segment(slug)}/items/media/save`,
      body,
    )
  }

  createDropAllowlistUpload(slug: string) {
    return this.fetcher.request<OperationResponse<"upload_drop_allowlist">>(
      "POST",
      `/api/v2/drops/${segment(slug)}/allowlist`,
    )
  }

  validateDropAllowlist(
    slug: string,
    body: WalletAuthRequest<"validate_drop_allowlist">,
  ) {
    return this.fetcher.request<OperationResponse<"validate_drop_allowlist">>(
      "POST",
      `/api/v2/drops/${segment(slug)}/allowlist/validate`,
      body,
    )
  }

  modifyCollection(slug: string, body: WalletAuthRequest<"modify_collection">) {
    return this.fetcher.request<OperationResponse<"modify_collection">>(
      "PATCH",
      `/api/v2/collections/${segment(slug)}`,
      body,
    )
  }

  updateCollectionMetadata(
    slug: string,
    body: WalletAuthRequest<"update_collection_metadata">,
  ) {
    return this.fetcher.request<
      OperationResponse<"update_collection_metadata">
    >("PATCH", `/api/v2/collections/${segment(slug)}/metadata`, body)
  }

  setCollectionVisibility(
    slug: string,
    body: WalletAuthRequest<"set_collection_visibility">,
  ) {
    return this.fetcher.request<OperationResponse<"set_collection_visibility">>(
      "PATCH",
      `/api/v2/collections/${segment(slug)}/visibility`,
      body,
    )
  }

  createCollectionImageUpload(slug: string, imageType: string) {
    return this.fetcher.request<OperationResponse<"upload_collection_image">>(
      "POST",
      `/api/v2/collections/${segment(slug)}/images/${segment(imageType)}`,
    )
  }

  updateProfileSettings(body: WalletAuthRequest<"update_profile_settings">) {
    return this.fetcher.request<OperationResponse<"update_profile_settings">>(
      "PATCH",
      "/api/v2/profile",
      body,
    )
  }

  claimProfileUsername(body: WalletAuthRequest<"claim_profile_username">) {
    return this.fetcher.request<OperationResponse<"claim_profile_username">>(
      "POST",
      "/api/v2/profile/username",
      body,
    )
  }

  createProfileImageUpload(body: WalletAuthRequest<"upload_profile_image">) {
    return this.fetcher.request<OperationResponse<"upload_profile_image">>(
      "POST",
      "/api/v2/profile/images",
      body,
    )
  }

  createProfileShelf(body: WalletAuthRequest<"create_profile_shelf">) {
    return this.fetcher.request<OperationResponse<"create_profile_shelf">>(
      "POST",
      "/api/v2/profile/shelves",
      body,
    )
  }

  reorderProfileShelves(body: WalletAuthRequest<"reorder_profile_shelves">) {
    return this.fetcher.request<OperationResponse<"reorder_profile_shelves">>(
      "PATCH",
      "/api/v2/profile/shelves",
      body,
    )
  }

  updateProfileShelf(
    shelfId: string,
    body: WalletAuthRequest<"update_profile_shelf">,
  ) {
    return this.fetcher.request<OperationResponse<"update_profile_shelf">>(
      "PATCH",
      `/api/v2/profile/shelves/${segment(shelfId)}`,
      body,
    )
  }

  deleteProfileShelf(shelfId: string) {
    return this.fetcher.request<OperationResponse<"delete_profile_shelf">>(
      "DELETE",
      `/api/v2/profile/shelves/${segment(shelfId)}`,
    )
  }

  linkWallet(body: WalletAuthRequest<"link_wallet_with_siwx">) {
    return this.fetcher.request<OperationResponse<"link_wallet_with_siwx">>(
      "POST",
      "/api/v2/accounts/wallets/siwx",
      body,
    )
  }

  unlinkWallet(wallet: string) {
    return this.fetcher.request<OperationResponse<"unlink_wallet">>(
      "DELETE",
      `/api/v2/accounts/wallets/${segment(wallet)}`,
    )
  }
}
