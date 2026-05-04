# sdk — Agent Conventions

TypeScript SDK for buying, selling, and managing NFTs and tokens on OpenSea. Supports ethers and viem providers.

## Quick Reference

```bash
cd packages/sdk
pnpm install
pnpm run build         # Build with tsc
pnpm run test          # Run unit tests with Vitest
pnpm run test:integration  # Run integration tests (requires API key)
pnpm run lint          # Lint with Biome
pnpm run format        # Format with Biome
pnpm run check-types   # TypeScript type checking (stricter tsconfig)
```

## Architecture

| Directory | Role |
|-----------|------|
| `src/sdk.ts` | `OpenSeaSDK` — main ethers entry point |
| `src/viem.ts` | `OpenSeaViemSDK` — viem entry point |
| `src/sdk/base.ts` | `BaseOpenSeaSDK` — shared logic for both providers |
| `src/sdk/fulfillment.ts` | Order fulfillment (buy, sell, match) via Seaport |
| `src/sdk/orders.ts` | Create and manage listings and offers |
| `src/sdk/cancellation.ts` | Order cancellation logic |
| `src/sdk/assets.ts` | Asset transfers and approvals |
| `src/sdk/tokens.ts` | ERC20 wrap/unwrap (WETH) |
| `src/sdk/context.ts` | Shared per-call context (provider, chain, API client) threaded through the SDK |
| `src/api/` | `OpenSeaAPI` client — all REST API calls |
| `src/provider/` | Provider abstraction: ethers adapter, viem adapter, Seaport bridge |
| `src/abi/` | Contract ABIs (ERC20, ERC721, ERC1155, Multicall3, TransferHelper) |
| `src/utils/` | Chain helpers, fee calculations, rate limiting, address utilities |
| `src/orders/` | Order types and Seaport parameter construction |
| `test/` | Unit and integration tests |

## Review Checklist

When reviewing changes to this package, verify:

1. **Chain enum sync**: The `Chain` enum in `src/types.ts` has a compile-time check (`_AssertAPIChainsCovered`) ensuring every `ChainIdentifier` from `@opensea/api-types` maps to a `Chain` value. When adding a chain, also update `scripts/chain-data.json` at the **monorepo root**, run `pnpm sync-chains` from the monorepo root, and update `getListingPaymentToken` / `getOfferPaymentToken` / `getNativeWrapTokenAddress`.

2. **Dual provider support**: Both `OpenSeaSDK` (ethers) and `OpenSeaViemSDK` (viem) must work. Changes to `BaseOpenSeaSDK` affect both. If adding provider-specific logic, ensure both adapters in `src/provider/` are updated.

3. **`@opensea/api-types` dependency**: The SDK imports types from the workspace `@opensea/api-types` package. If the OpenAPI spec changes, rebuild api-types first (`pnpm --filter @opensea/api-types run build`) before testing the SDK. **Never hand-roll API request/response types in `src/api/types.ts`** — always import from `@opensea/api-types` (or re-export through `src/api/types.ts`) using the canonical OpenAPI schema names. The `pnpm check-api-paths` CI guardrail will fail the build if `src/api/apiPaths.ts` references a URL that isn't in `packages/api-types/opensea-api.json`. See the top-level [AGENTS.md → "Adding a new OpenSea API endpoint"](../../AGENTS.md#adding-a-new-opensea-api-endpoint-to-the-sdk-or-cli) for the full flow.

4. **Seaport integration**: Order creation and fulfillment flows use `@opensea/seaport-js`. Changes to order parameters, consideration items, or fulfillment logic must be tested against the Seaport contract behavior.

5. **No secret leakage**: API keys are passed via `OpenSeaAPIConfig.apiKey`. Never log or expose them. Integration tests read keys from environment variables.

## Conventions

- CommonJS (`"type": "commonjs"`). The SDK is consumed by both CJS and ESM projects.
- Biome for linting and formatting (config at monorepo root).
- `viem` is an optional peer dependency — the main entry point uses ethers; `@opensea/sdk/viem` is the viem entry point.
- Amounts use the `Amount` type (`string | number | bigint`). Prefer `string` for decimal values to avoid floating-point precision issues.
- The `Chain` enum uses API slug strings (e.g. `"ethereum"`, `"base"`), not numeric chain IDs.

## Testing

- **Unit tests** (`test/`): Mock API responses, test order construction and parameter validation.
- **Integration tests** (`test/integration/`): Hit the real API. Require `OPENSEA_API_KEY` env var. Run separately with `pnpm run test:integration`.
- Always run `pnpm run check-types` — it uses a stricter tsconfig than the build.
