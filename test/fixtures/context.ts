import * as sinon from "sinon";
import { SDKContext } from "../../src/sdk/context";
import { Chain } from "../../src/types";

// eslint-disable-next-line import/no-unused-modules
export interface MockContextOptions {
  chain?: Chain;
  api?: unknown;
  seaport?: unknown;
  logger?: sinon.SinonStub;
  dispatch?: sinon.SinonStub;
  confirmTransaction?: sinon.SinonStub;
  requireAccountIsAvailable?: sinon.SinonStub;
  signerOrProvider?: unknown;
  provider?: unknown;
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
    signerOrProvider: options.signerOrProvider ?? ({} as unknown),
    provider: options.provider ?? ({} as unknown),
    api: options.api ?? ({} as unknown),
    seaport: options.seaport ?? ({} as unknown),
    logger: options.logger ?? sinon.stub(),
    dispatch: options.dispatch ?? sinon.stub(),
    confirmTransaction: options.confirmTransaction ?? sinon.stub().resolves(),
    requireAccountIsAvailable:
      options.requireAccountIsAvailable ?? sinon.stub().resolves(),
  } as SDKContext;
}
