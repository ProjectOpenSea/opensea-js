import { vi } from "vitest"
import type { SDKContext } from "../../src/sdk/context"
import { Chain } from "../../src/types"

export interface MockContextOptions {
  chain?: Chain
  api?: unknown
  seaport?: unknown
  logger?: ReturnType<typeof vi.fn>
  dispatch?: ReturnType<typeof vi.fn>
  confirmTransaction?: ReturnType<typeof vi.fn>
  requireAccountIsAvailable?: ReturnType<typeof vi.fn>
  wallet?: unknown
  contractCaller?: unknown
}

/**
 * Creates a mock SDKContext for testing purposes.
 * All dependencies are stubbed by default but can be overridden.
 */
export function createMockContext(
  options: MockContextOptions = {},
): SDKContext {
  return {
    chain: options.chain ?? Chain.Mainnet,
    wallet: options.wallet ?? ({} as unknown),
    contractCaller: options.contractCaller ?? ({} as unknown),
    api: options.api ?? ({} as unknown),
    seaport: options.seaport ?? ({} as unknown),
    logger: options.logger ?? vi.fn(),
    dispatch: options.dispatch ?? vi.fn(),
    confirmTransaction:
      options.confirmTransaction ?? vi.fn().mockResolvedValue(undefined),
    requireAccountIsAvailable:
      options.requireAccountIsAvailable ?? vi.fn().mockResolvedValue(undefined),
  } as SDKContext
}
