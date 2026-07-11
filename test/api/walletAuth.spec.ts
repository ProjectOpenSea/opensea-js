import { beforeEach, describe, expect, it, vi } from "vitest"
import type { WalletAuthFetcher } from "../../src/api/fetcher"
import { WalletAuthAPI } from "../../src/api/walletAuth"

describe("WalletAuthAPI", () => {
  const get = vi.fn().mockResolvedValue({})
  const request = vi.fn().mockResolvedValue({})
  const api = new WalletAuthAPI({
    get,
    request,
  } as unknown as WalletAuthFetcher)

  beforeEach(() => {
    get.mockClear()
    request.mockClear()
  })

  it("routes every scoped write helper to the documented method and path", async () => {
    const body = {} as never
    const cases: [string, string, () => Promise<unknown>][] = [
      ["POST", "/api/v2/watchlist", () => api.addWatchlistEntry(body)],
      ["DELETE", "/api/v2/watchlist", () => api.removeWatchlistEntry(body)],
      [
        "POST",
        "/api/v2/orders/chain/base/protocol/0xabc/order-1/cancel",
        () => api.cancelOrder("base", "0xabc", "order-1", body),
      ],
      [
        "POST",
        "/api/v2/drops/my%20drop",
        () => api.saveDropEdits("my drop", body),
      ],
      [
        "POST",
        "/api/v2/drops/drop/prereveal-item",
        () => api.savePrerevealDropItem("drop", body),
      ],
      [
        "POST",
        "/api/v2/drops/drop/items",
        () => api.saveSelfMintDropItem("drop", body),
      ],
      [
        "PUT",
        "/api/v2/drops/drop/items/1",
        () => api.updateSelfMintDropItem("drop", 1, body),
      ],
      [
        "PATCH",
        "/api/v2/drops/drop/items/1",
        () => api.updateDropItem("drop", 1, body),
      ],
      [
        "POST",
        "/api/v2/drops/drop/items/media",
        () => api.createDropItemMediaUpload("drop", body),
      ],
      [
        "POST",
        "/api/v2/drops/drop/items/media/save",
        () => api.saveDropItemMedia("drop", body),
      ],
      [
        "POST",
        "/api/v2/drops/drop/allowlist",
        () => api.createDropAllowlistUpload("drop"),
      ],
      [
        "POST",
        "/api/v2/drops/drop/allowlist/validate",
        () => api.validateDropAllowlist("drop", body),
      ],
      [
        "PATCH",
        "/api/v2/collections/collection",
        () => api.modifyCollection("collection", body),
      ],
      [
        "PATCH",
        "/api/v2/collections/collection/metadata",
        () => api.updateCollectionMetadata("collection", body),
      ],
      [
        "PATCH",
        "/api/v2/collections/collection/visibility",
        () => api.setCollectionVisibility("collection", body),
      ],
      [
        "POST",
        "/api/v2/collections/collection/images/banner",
        () => api.createCollectionImageUpload("collection", "banner"),
      ],
      ["PATCH", "/api/v2/profile", () => api.updateProfileSettings(body)],
      [
        "POST",
        "/api/v2/profile/username",
        () => api.claimProfileUsername(body),
      ],
      [
        "POST",
        "/api/v2/profile/images",
        () => api.createProfileImageUpload(body),
      ],
      ["POST", "/api/v2/profile/shelves", () => api.createProfileShelf(body)],
      [
        "PATCH",
        "/api/v2/profile/shelves",
        () => api.reorderProfileShelves(body),
      ],
      [
        "PATCH",
        "/api/v2/profile/shelves/shelf-1",
        () => api.updateProfileShelf("shelf-1", body),
      ],
      [
        "DELETE",
        "/api/v2/profile/shelves/shelf-1",
        () => api.deleteProfileShelf("shelf-1"),
      ],
      ["POST", "/api/v2/accounts/wallets/siwx", () => api.linkWallet(body)],
      [
        "DELETE",
        "/api/v2/accounts/wallets/0xabc",
        () => api.unlinkWallet("0xabc"),
      ],
    ]

    for (const [method, path, run] of cases) {
      request.mockClear()
      await run()
      expect(request.mock.calls[0]?.slice(0, 2)).toEqual([method, path])
    }
  })

  it("routes scoped reads with query support", async () => {
    await api.getDropEligibility("drop")
    expect(get).toHaveBeenLastCalledWith("/api/v2/drops/drop/eligibility")

    await api.getFavorites("0xabc", { limit: 1 })
    expect(get).toHaveBeenLastCalledWith("/api/v2/account/0xabc/favorites", {
      limit: 1,
    })

    await api.getTokenWatchlist("0xabc")
    expect(get).toHaveBeenLastCalledWith(
      "/api/v2/account/0xabc/token_watchlist",
    )

    await api.getPerpetualWatchlist("0xabc")
    expect(get).toHaveBeenLastCalledWith(
      "/api/v2/account/0xabc/perpetual_watchlist",
    )
  })
})
