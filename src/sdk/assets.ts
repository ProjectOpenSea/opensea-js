import {
  BigNumberish,
  Contract,
  Signer,
  Overrides,
  ContractTransactionResponse,
  ethers,
} from "ethers";
import { TRANSFER_HELPER_ADDRESS, MULTICALL3_ADDRESS } from "../constants";
import { SDKContext } from "./context";
import {
  ERC1155__factory,
  ERC20__factory,
  ERC721__factory,
} from "../typechain/contracts";
import { EventType, TokenStandard, AssetWithTokenStandard } from "../types";
import { getDefaultConduit } from "../utils/utils";

/**
 * Asset transfer and approval operations
 */
export class AssetsManager {
  constructor(private context: SDKContext) {}

  /**
   * Get an account's balance of any Asset. This asset can be an ERC20, ERC1155, or ERC721.
   * @param options
   * @param options.accountAddress Account address to check
   * @param options.asset The Asset to check balance for. tokenStandard must be set.
   * @returns The balance of the asset for the account.
   *
   * @throws Error if the token standard does not support balanceOf.
   */
  async getBalance({
    accountAddress,
    asset,
  }: {
    accountAddress: string;
    asset: AssetWithTokenStandard;
  }): Promise<bigint> {
    switch (asset.tokenStandard) {
      case TokenStandard.ERC20: {
        const contract = ERC20__factory.connect(
          asset.tokenAddress,
          this.context.provider,
        );
        return await contract.balanceOf.staticCall(accountAddress);
      }
      case TokenStandard.ERC1155: {
        if (asset.tokenId === undefined || asset.tokenId === null) {
          throw new Error("Missing ERC1155 tokenId for getBalance");
        }
        const contract = ERC1155__factory.connect(
          asset.tokenAddress,
          this.context.provider,
        );
        return await contract.balanceOf.staticCall(
          accountAddress,
          asset.tokenId,
        );
      }
      case TokenStandard.ERC721: {
        if (asset.tokenId === undefined || asset.tokenId === null) {
          throw new Error("Missing ERC721 tokenId for getBalance");
        }
        const contract = ERC721__factory.connect(
          asset.tokenAddress,
          this.context.provider,
        );
        try {
          const owner = await contract.ownerOf.staticCall(asset.tokenId);
          return BigInt(owner.toLowerCase() == accountAddress.toLowerCase());
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          this.context.logger(
            `Failed to get ownerOf ERC721: ${error.message ?? error}`,
          );
          return 0n;
        }
      }
      default:
        throw new Error("Unsupported token standard for getBalance");
    }
  }

  /**
   * Transfer an asset. This asset can be an ERC20, ERC1155, or ERC721.
   * @param options
   * @param options.asset The Asset to transfer. tokenStandard must be set.
   * @param options.amount Amount of asset to transfer. Not used for ERC721.
   * @param options.fromAddress The address to transfer from
   * @param options.toAddress The address to transfer to
   * @param options.overrides Transaction overrides, ignored if not set.
   */
  async transfer({
    asset,
    amount,
    fromAddress,
    toAddress,
    overrides,
  }: {
    asset: AssetWithTokenStandard;
    amount?: BigNumberish;
    fromAddress: string;
    toAddress: string;
    overrides?: Overrides;
  }): Promise<void> {
    overrides = { ...overrides, from: fromAddress };
    let transaction: Promise<ContractTransactionResponse>;

    switch (asset.tokenStandard) {
      case TokenStandard.ERC20: {
        if (!amount) {
          throw new Error("Missing ERC20 amount for transfer");
        }
        const contract = ERC20__factory.connect(
          asset.tokenAddress,
          this.context.signerOrProvider,
        );
        transaction = contract.transfer(toAddress, amount, overrides);
        break;
      }
      case TokenStandard.ERC1155: {
        if (asset.tokenId === undefined || asset.tokenId === null) {
          throw new Error("Missing ERC1155 tokenId for transfer");
        }
        if (!amount) {
          throw new Error("Missing ERC1155 amount for transfer");
        }
        const contract = ERC1155__factory.connect(
          asset.tokenAddress,
          this.context.signerOrProvider,
        );
        transaction = contract.safeTransferFrom(
          fromAddress,
          toAddress,
          asset.tokenId,
          amount,
          "0x",
          overrides,
        );
        break;
      }
      case TokenStandard.ERC721: {
        if (asset.tokenId === undefined || asset.tokenId === null) {
          throw new Error("Missing ERC721 tokenId for transfer");
        }
        const contract = ERC721__factory.connect(
          asset.tokenAddress,
          this.context.signerOrProvider,
        );
        transaction = contract.transferFrom(
          fromAddress,
          toAddress,
          asset.tokenId,
          overrides,
        );
        break;
      }
      default:
        throw new Error("Unsupported token standard for transfer");
    }

    try {
      const transactionResponse = await transaction;
      await this.context.confirmTransaction(
        transactionResponse.hash,
        EventType.Transfer,
        "Transferring asset",
      );
    } catch (error) {
      console.error(error);
      this.context.dispatch(EventType.TransactionDenied, {
        error,
        accountAddress: fromAddress,
      });
    }
  }

  /**
   * Bulk transfer multiple assets using OpenSea's TransferHelper contract.
   * This method is more gas-efficient than calling transfer() multiple times.
   * Note: All assets must be approved for transfer to the OpenSea conduit before calling this method.
   * @param options
   * @param options.assets Array of assets to transfer. Each asset must have tokenStandard set.
   * @param options.fromAddress The address to transfer from
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the bulk transfer
   *
   * @throws Error if any asset is missing required fields (tokenId for NFTs, amount for ERC20/ERC1155).
   * @throws Error if any asset is not approved for transfer to the OpenSea conduit.
   * @throws Error if the fromAddress is not available through wallet or provider.
   */
  async bulkTransfer({
    assets,
    fromAddress,
    overrides,
  }: {
    assets: Array<{
      asset: AssetWithTokenStandard;
      toAddress: string;
      amount?: BigNumberish;
    }>;
    fromAddress: string;
    overrides?: Overrides;
  }): Promise<string> {
    // Validate basic parameters before making any blockchain calls
    if (assets.length === 0) {
      throw new Error("At least one asset must be provided");
    }

    // Validate asset data and build transfer items array for TransferHelper
    // This validation happens before any blockchain calls to ensure proper error messages
    const transferItems: Array<{
      itemType: number;
      token: string;
      identifier: string;
      amount: string;
      recipient: string;
    }> = [];

    for (const { asset, toAddress, amount } of assets) {
      let itemType: number;
      let identifier: string;
      let transferAmount: string;

      switch (asset.tokenStandard) {
        case TokenStandard.ERC20:
          itemType = 1; // ERC20
          identifier = "0";
          if (!amount) {
            throw new Error("Missing ERC20 amount for bulk transfer");
          }
          transferAmount = amount.toString();
          break;

        case TokenStandard.ERC721:
          itemType = 2; // ERC721
          if (asset.tokenId === undefined || asset.tokenId === null) {
            throw new Error("Missing ERC721 tokenId for bulk transfer");
          }
          identifier = asset.tokenId.toString();
          transferAmount = "1";
          break;

        case TokenStandard.ERC1155:
          itemType = 3; // ERC1155
          if (asset.tokenId === undefined || asset.tokenId === null) {
            throw new Error("Missing ERC1155 tokenId for bulk transfer");
          }
          if (!amount) {
            throw new Error("Missing ERC1155 amount for bulk transfer");
          }
          identifier = asset.tokenId.toString();
          transferAmount = amount.toString();
          break;

        default:
          throw new Error(
            `Unsupported token standard for bulk transfer: ${asset.tokenStandard}`,
          );
      }

      transferItems.push({
        itemType,
        token: asset.tokenAddress,
        identifier,
        amount: transferAmount,
        recipient: toAddress,
      });
    }

    // Check account availability after parameter validation
    await this.context.requireAccountIsAvailable(fromAddress);

    // Get the chain-specific default conduit
    const defaultConduit = getDefaultConduit(this.context.chain);

    // Check approvals for all assets before attempting transfer
    const unapprovedAssets: string[] = [];
    for (const { asset, amount } of assets) {
      const isApproved = await this.checkAssetApproval(
        asset,
        fromAddress,
        defaultConduit.address,
        amount,
      );
      if (!isApproved) {
        const assetIdentifier =
          asset.tokenId !== undefined
            ? `${asset.tokenAddress}:${asset.tokenId}`
            : asset.tokenAddress;
        unapprovedAssets.push(assetIdentifier);
      }
    }

    if (unapprovedAssets.length > 0) {
      throw new Error(
        `The following asset(s) are not approved for transfer to the OpenSea conduit:\n${unapprovedAssets.join("\n")}\n\n` +
          `Please approve these assets before transferring. You can use the batchApproveAssets() method to approve multiple assets efficiently in a single transaction.`,
      );
    }

    // Create TransferHelper contract instance
    const transferHelper = this.getTransferHelperContract();

    this.context.dispatch(EventType.Transfer, {
      accountAddress: fromAddress,
      assets,
    });

    try {
      // Use chain-specific conduit key for bulk transfers
      const transaction = await transferHelper.bulkTransfer(
        transferItems,
        defaultConduit.key,
        { ...overrides, from: fromAddress },
      );

      await this.context.confirmTransaction(
        transaction.hash,
        EventType.Transfer,
        `Bulk transferring ${assets.length} asset(s)`,
      );

      return transaction.hash;
    } catch (error) {
      console.error(error);
      this.context.dispatch(EventType.TransactionDenied, {
        error,
        accountAddress: fromAddress,
      });
      throw error;
    }
  }

  /**
   * Batch approve multiple assets for transfer to the OpenSea conduit.
   * This method checks which assets need approval and batches them efficiently:
   * - 0 approvals needed: Returns early
   * - 1 approval needed: Sends single transaction
   * - 2+ approvals needed: Uses Multicall3 to batch all approvals in one transaction
   *
   * @param options
   * @param options.assets Array of assets to approve for transfer
   * @param options.fromAddress The address that owns the assets
   * @param options.overrides Transaction overrides, ignored if not set.
   * @returns Transaction hash of the approval transaction, or undefined if no approvals needed
   *
   * @throws Error if the fromAddress is not available through wallet or provider.
   */
  async batchApproveAssets({
    assets,
    fromAddress,
    overrides,
  }: {
    assets: Array<{
      asset: AssetWithTokenStandard;
      amount?: BigNumberish;
    }>;
    fromAddress: string;
    overrides?: Overrides;
  }): Promise<string | undefined> {
    // Validate basic parameters before making any blockchain calls
    if (assets.length === 0) {
      return undefined;
    }

    // Validate ERC20 assets have amounts before making any blockchain calls
    for (const { asset, amount } of assets) {
      if (asset.tokenStandard === TokenStandard.ERC20 && !amount) {
        throw new Error(
          `Amount required for ERC20 approval: ${asset.tokenAddress}`,
        );
      }
    }

    // Check account availability after parameter validation
    await this.context.requireAccountIsAvailable(fromAddress);

    // Get the chain-specific default conduit
    const defaultConduit = getDefaultConduit(this.context.chain);

    // Check which assets need approval and build approval calldata
    const approvalsNeeded: Array<{ target: string; callData: string }> = [];
    const processedContracts = new Set<string>();

    for (const { asset, amount } of assets) {
      const isApproved = await this.checkAssetApproval(
        asset,
        fromAddress,
        defaultConduit.address,
        amount,
      );

      if (!isApproved) {
        // For ERC721/ERC1155, only approve once per contract
        if (
          asset.tokenStandard === TokenStandard.ERC721 ||
          asset.tokenStandard === TokenStandard.ERC1155
        ) {
          if (processedContracts.has(asset.tokenAddress.toLowerCase())) {
            continue;
          }
          processedContracts.add(asset.tokenAddress.toLowerCase());

          // setApprovalForAll(operator, true)
          const iface = new ethers.Interface([
            "function setApprovalForAll(address operator, bool approved)",
          ]);
          const callData = iface.encodeFunctionData("setApprovalForAll", [
            defaultConduit.address,
            true,
          ]);
          approvalsNeeded.push({
            target: asset.tokenAddress,
            callData,
          });
        } else if (asset.tokenStandard === TokenStandard.ERC20) {
          // approve(spender, amount) - use max uint256 for unlimited
          const iface = new ethers.Interface([
            "function approve(address spender, uint256 amount) returns (bool)",
          ]);
          const callData = iface.encodeFunctionData("approve", [
            defaultConduit.address,
            ethers.MaxUint256, // Approve max for convenience
          ]);
          approvalsNeeded.push({
            target: asset.tokenAddress,
            callData,
          });
        }
      }
    }

    // No approvals needed
    if (approvalsNeeded.length === 0) {
      return undefined;
    }

    // Single approval: send directly
    if (approvalsNeeded.length === 1) {
      const { target, callData } = approvalsNeeded[0];
      const signer = this.context.signerOrProvider as Signer;
      const tx = await signer.sendTransaction({
        to: target,
        data: callData,
        ...overrides,
        from: fromAddress,
      });

      await this.context.confirmTransaction(
        tx.hash,
        EventType.ApproveAllAssets,
        "Approving asset for transfer",
      );

      return tx.hash;
    }

    // Multiple approvals: use Multicall3
    const multicall3 = this.getMulticall3Contract();

    const calls = approvalsNeeded.map(({ target, callData }) => ({
      target,
      allowFailure: false,
      callData,
    }));

    try {
      const transaction = await multicall3.aggregate3(calls, {
        ...overrides,
        from: fromAddress,
      });

      await this.context.confirmTransaction(
        transaction.hash,
        EventType.ApproveAllAssets,
        `Batch approving ${approvalsNeeded.length} asset(s) for transfer`,
      );

      return transaction.hash;
    } catch (error) {
      console.error(error);
      this.context.dispatch(EventType.TransactionDenied, {
        error,
        accountAddress: fromAddress,
      });
      throw error;
    }
  }

  /**
   * Check if an asset is approved for transfer to a specific operator (conduit).
   * @param asset The asset to check approval for
   * @param owner The owner address
   * @param operator The operator address (conduit)
   * @param amount Optional amount for ERC20 tokens
   * @returns True if approved, false otherwise
   */
  private async checkAssetApproval(
    asset: AssetWithTokenStandard,
    owner: string,
    operator: string,
    amount?: BigNumberish,
  ): Promise<boolean> {
    try {
      switch (asset.tokenStandard) {
        case TokenStandard.ERC20: {
          const contract = ERC20__factory.connect(
            asset.tokenAddress,
            this.context.provider,
          );
          const allowance = await contract.allowance.staticCall(
            owner,
            operator,
          );
          // Check if allowance is sufficient
          if (!amount) {
            return false;
          }
          return allowance >= BigInt(amount.toString());
        }

        case TokenStandard.ERC721: {
          const contract = ERC721__factory.connect(
            asset.tokenAddress,
            this.context.provider,
          );
          // Check isApprovedForAll first
          const isApprovedForAll = await contract.isApprovedForAll.staticCall(
            owner,
            operator,
          );
          if (isApprovedForAll) {
            return true;
          }
          // Check individual token approval
          if (asset.tokenId !== undefined && asset.tokenId !== null) {
            const approved = await contract.getApproved.staticCall(
              asset.tokenId,
            );
            return approved.toLowerCase() === operator.toLowerCase();
          }
          return false;
        }

        case TokenStandard.ERC1155: {
          const contract = ERC1155__factory.connect(
            asset.tokenAddress,
            this.context.provider,
          );
          return await contract.isApprovedForAll.staticCall(owner, operator);
        }

        default:
          return false;
      }
    } catch (error) {
      // If there's an error checking approval (e.g., contract doesn't exist), return false
      this.context.logger(
        `Error checking approval for ${asset.tokenAddress}: ${error}`,
      );
      return false;
    }
  }

  /**
   * Get a TransferHelper contract instance.
   * @returns Contract instance for TransferHelper
   */
  private getTransferHelperContract(): Contract {
    return new Contract(
      TRANSFER_HELPER_ADDRESS,
      [
        "function bulkTransfer(tuple(uint8 itemType, address token, uint256 identifier, uint256 amount, address recipient)[] items, bytes32 conduitKey) external returns (bytes4)",
      ],
      this.context.signerOrProvider,
    );
  }

  /**
   * Get a Multicall3 contract instance.
   * @returns Contract instance for Multicall3
   */
  private getMulticall3Contract(): Contract {
    return new Contract(
      MULTICALL3_ADDRESS,
      [
        "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)",
      ],
      this.context.signerOrProvider,
    );
  }
}
