import {
  CROSS_CHAIN_SEAPORT_V1_5_ADDRESS,
  ItemType,
} from "@opensea/seaport-js/lib/constants";
import { BigNumber, ethers } from "ethers";
import {
  MAX_EXPIRATION_MONTHS,
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS,
  SHARED_STOREFRONT_ADDRESS_MAINNET,
  SHARED_STOREFRONT_ADDRESS_GOERLI,
} from "../constants";
import {
  AssetEvent,
  Chain,
  OpenSeaAccount,
  OpenSeaAsset,
  OpenSeaAssetBundle,
  OpenSeaAssetContract,
  OpenSeaCollection,
  OpenSeaFungibleToken,
  OpenSeaTraitStats,
  OpenSeaUser,
  Order,
  OrderSide,
  TokenStandard,
  Transaction,
  UnsignedOrder,
} from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const assetFromJSON = (asset: any): OpenSeaAsset => {
  const isAnimated = asset.image_url && asset.image_url.endsWith(".gif");
  const isSvg = asset.image_url && asset.image_url.endsWith(".svg");
  const fromJSON: OpenSeaAsset = {
    tokenId: asset.token_id.toString(),
    tokenAddress: asset.asset_contract.address,
    name: asset.name,
    description: asset.description,
    owner: asset.owner,
    assetContract: assetContractFromJSON(asset.asset_contract),
    collection: collectionFromJSON(asset.collection),

    isPresale: asset.is_presale,
    // Don't use previews if it's a special image
    imageUrl:
      isAnimated || isSvg
        ? asset.image_url
        : asset.image_preview_url || asset.image_url,
    imagePreviewUrl: asset.image_preview_url,
    imageUrlOriginal: asset.image_original_url,
    imageUrlThumbnail: asset.image_thumbnail_url,

    animationUrl: asset.animation_url,
    animationUrlOriginal: asset.animation_original_url,

    externalLink: asset.external_link,
    openseaLink: asset.permalink,
    traits: asset.traits,
    numSales: asset.num_sales,
    lastSale: asset.last_sale ? assetEventFromJSON(asset.last_sale) : null,
    backgroundColor: asset.background_color
      ? `#${asset.background_color}`
      : null,
  };
  return fromJSON;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const assetEventFromJSON = (assetEvent: any): AssetEvent => {
  return {
    eventType: assetEvent.event_type,
    eventTimestamp: assetEvent.event_timestamp,
    auctionType: assetEvent.auction_type,
    totalPrice: assetEvent.total_price,
    transaction: assetEvent.transaction
      ? transactionFromJSON(assetEvent.transaction)
      : null,
    paymentToken: assetEvent.payment_token
      ? tokenFromJSON(assetEvent.payment_token)
      : null,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transactionFromJSON = (transaction: any): Transaction => {
  return {
    fromAccount: accountFromJSON(transaction.from_account),
    toAccount: accountFromJSON(transaction.to_account),
    createdDate: new Date(`${transaction.created_date}Z`),
    modifiedDate: new Date(`${transaction.modified_date}Z`),
    transactionHash: transaction.transaction_hash,
    transactionIndex: transaction.transaction_index,
    blockNumber: transaction.block_number,
    blockHash: transaction.block_hash,
    timestamp: new Date(`${transaction.timestamp}Z`),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const accountFromJSON = (account: any): OpenSeaAccount => {
  return {
    address: account.address,
    config: account.config,
    profileImgUrl: account.profile_img_url,
    user: account.user ? userFromJSON(account.user) : null,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const userFromJSON = (user: any): OpenSeaUser => {
  return {
    username: user.username,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const assetBundleFromJSON = (asset_bundle: any): OpenSeaAssetBundle => {
  const fromJSON: OpenSeaAssetBundle = {
    maker: asset_bundle.maker,
    assets: asset_bundle.assets ? asset_bundle.assets.map(assetFromJSON) : [],
    assetContract: asset_bundle.asset_contract
      ? assetContractFromJSON(asset_bundle.asset_contract)
      : undefined,
    name: asset_bundle.name,
    slug: asset_bundle.slug,
    description: asset_bundle.description,
    externalLink: asset_bundle.external_link,
    permalink: asset_bundle.permalink,
  };

  return fromJSON;
};

export const assetContractFromJSON = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asset_contract: any,
): OpenSeaAssetContract => {
  return {
    name: asset_contract.name,
    description: asset_contract.description,
    type: asset_contract.asset_contract_type,
    tokenStandard: asset_contract.schema_name,
    address: asset_contract.address,
    tokenSymbol: asset_contract.symbol,
    buyerFeeBasisPoints: +asset_contract.buyer_fee_basis_points,
    sellerFeeBasisPoints: +asset_contract.seller_fee_basis_points,
    openseaBuyerFeeBasisPoints: +asset_contract.opensea_buyer_fee_basis_points,
    openseaSellerFeeBasisPoints:
      +asset_contract.opensea_seller_fee_basis_points,
    devBuyerFeeBasisPoints: +asset_contract.dev_buyer_fee_basis_points,
    devSellerFeeBasisPoints: +asset_contract.dev_seller_fee_basis_points,
    imageUrl: asset_contract.image_url,
    externalLink: asset_contract.external_link,
    wikiLink: asset_contract.wiki_link,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const collectionFromJSON = (collection: any): OpenSeaCollection => {
  const createdDate = new Date(`${collection.created_date}Z`);

  return {
    createdDate,
    name: collection.name,
    description: collection.description,
    slug: collection.slug,
    editors: collection.editors,
    hidden: collection.hidden,
    featured: collection.featured,
    featuredImageUrl: collection.featured_image_url,
    displayData: collection.display_data,
    safelistRequestStatus: collection.safelist_request_status,
    paymentTokens: (collection.payment_tokens ?? []).map(tokenFromJSON),
    openseaBuyerFeeBasisPoints: +collection.opensea_buyer_fee_basis_points,
    openseaSellerFeeBasisPoints: +collection.opensea_seller_fee_basis_points,
    devBuyerFeeBasisPoints: +collection.dev_buyer_fee_basis_points,
    devSellerFeeBasisPoints: +collection.dev_seller_fee_basis_points,
    payoutAddress: collection.payout_address,
    imageUrl: collection.image_url,
    largeImageUrl: collection.large_image_url,
    stats: collection.stats,
    traitStats: collection.traits as OpenSeaTraitStats,
    externalLink: collection.external_url,
    wikiLink: collection.wiki_url,
    fees: {
      openseaFees: new Map(Object.entries(collection.fees.opensea_fees ?? {})),
      sellerFees: new Map(Object.entries(collection.fees.seller_fees ?? {})),
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tokenFromJSON = (token: any): OpenSeaFungibleToken => {
  const fromJSON: OpenSeaFungibleToken = {
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    address: token.address,
    imageUrl: token.image_url,
    ethPrice: token.eth_price,
    usdPrice: token.usd_price,
  };

  return fromJSON;
};

/**
 * Estimate gas usage for a transaction.
 * @param provider The Provider
 * @param from Address sending transaction
 * @param to Destination contract address
 * @param data Data to send to contract
 * @param value Value in ETH to send with data
 */
export async function estimateGas(
  provider: ethers.providers.Provider,
  { from, to, data, value = BigNumber.from(0) }: ethers.Transaction,
) {
  return await provider.estimateGas({
    from,
    to,
    value: value.toString(),
    data,
  });
}

/**
 * Assign an order and a new matching order to their buy/sell sides
 * @param order Original order
 * @param matchingOrder The result of _makeMatchingOrder
 */
export function assignOrdersToSides(
  order: Order,
  matchingOrder: UnsignedOrder,
): { buy: Order; sell: Order } {
  const isSellOrder = order.side == OrderSide.Sell;

  let buy: Order;
  let sell: Order;
  if (!isSellOrder) {
    buy = order;
    sell = {
      ...matchingOrder,
      v: buy.v,
      r: buy.r,
      s: buy.s,
    };
  } else {
    sell = order;
    buy = {
      ...matchingOrder,
      v: sell.v,
      r: sell.r,
      s: sell.s,
    };
  }

  return { buy, sell };
}

/**
 * Delay using setTimeout
 * @param ms milliseconds to wait
 */
export async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Get special-case approval addresses for an erc721 contract
 * @param erc721Contract contract to check
 */
export async function getNonCompliantApprovalAddress(
  erc721Contract: ethers.Contract,
  tokenId: string,
  _accountAddress: string,
): Promise<string | undefined> {
  const results = await Promise.allSettled([
    // CRYPTOKITTIES check
    erc721Contract.methods.kittyIndexToApproved(tokenId).call(),
    // Etherbots check
    erc721Contract.methods.partIndexToApproved(tokenId).call(),
  ]);

  return results.filter(Boolean)[0].status;
}

/**
 * The longest time that an order is valid for is one month from the current date
 * @returns unix timestamp
 */
export const getMaxOrderExpirationTimestamp = () => {
  const maxExpirationDate = new Date();

  maxExpirationDate.setMonth(
    maxExpirationDate.getMonth() + MAX_EXPIRATION_MONTHS,
  );
  maxExpirationDate.setDate(maxExpirationDate.getDate() - 1);

  return Math.round(maxExpirationDate.getTime() / 1000);
};

interface ErrorWithCode extends Error {
  code: string;
}

export const hasErrorCode = (error: unknown): error is ErrorWithCode => {
  const untypedError = error as Partial<ErrorWithCode>;
  return !!untypedError.code;
};

export const getAssetItemType = (tokenStandard?: TokenStandard) => {
  switch (tokenStandard) {
    case "ERC20":
      return ItemType.ERC20;
    case "ERC721":
      return ItemType.ERC721;
    case "ERC1155":
      return ItemType.ERC1155;
    default:
      throw new Error(`Unknown schema name: ${tokenStandard}`);
  }
};

export const getWETHAddress = (chain: Chain) => {
  switch (chain) {
    case Chain.Mainnet:
      return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    case Chain.Polygon:
      return "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
    case Chain.Goerli:
      return "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6";
    case Chain.Sepolia:
      return "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
    case Chain.Klaytn:
      return "0xfd844c2fca5e595004b17615f891620d1cb9bbb2";
    case Chain.Baobab:
      return "0x9330dd6713c8328a8d82b14e3f60a0f0b4cc7bfb";
    case Chain.Avalanche:
      return "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";
    case Chain.Fuji:
      return "0xd00ae08403B9bbb9124bB305C09058E32C39A48c";
    case Chain.BNB:
      return "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
    case Chain.BNBTestnet:
      return "0xae13d989dac2f0debff460ac112a837c89baa7cd";
    // OP Chains have weth at the same address
    case Chain.Optimism:
    case Chain.Zora:
    case Chain.ZoraTestnet:
      return "0x4200000000000000000000000000000000000006";
    default:
      throw new Error(`WETH is not supported on ${chain}`);
  }
};

const SHARED_STOREFRONT_ADDRESSES = new Set([
  SHARED_STOREFRONT_ADDRESS_MAINNET.toLowerCase(),
  SHARED_STOREFRONT_ADDRESS_GOERLI.toLowerCase(),
]);

/**
 * Checks if the token address is the shared storefront address and if so replaces
 * that address with the lazy mint adapter addres. Otherwise, returns the input token address
 * @param tokenAddress token address
 * @returns input token address or lazy mint adapter address
 */
export const getAddressAfterRemappingSharedStorefrontAddressToLazyMintAdapterAddress =
  (tokenAddress: string): string => {
    return SHARED_STOREFRONT_ADDRESSES.has(tokenAddress.toLowerCase())
      ? SHARED_STOREFRONT_LAZY_MINT_ADAPTER_CROSS_CHAIN_ADDRESS
      : tokenAddress;
  };

/**
 * Sums up the basis points for an Opensea or seller fee map and returns the
 * single numeric value if the map is not empty. Otherwise, it returns 0
 * @param fees a `Fees` submap holding fees (either Fees.openseaFees
 *  or Fees.sellerFees)
 * @returns sum of basis points in a fee map
 */
export const feesToBasisPoints = (
  fees: Map<string, number> | undefined,
): number => {
  if (!fees) {
    return 0;
  }

  return Array.from(fees.values()).reduce(
    (sum, basisPoints) => basisPoints + sum,
    0,
  );
};

/**
 * Checks whether the current chain is a test chain.
 * @param chain Chain to check.
 * @returns True if the chain is a test chain.
 */
export const isTestChain = (chain: Chain): boolean => {
  switch (chain) {
    case Chain.Goerli:
    case Chain.Sepolia:
    case Chain.Mumbai:
    case Chain.Baobab:
    case Chain.BNBTestnet:
    case Chain.ArbitrumGoerli:
    case Chain.Fuji:
    case Chain.OptimismGoerli:
    case Chain.SolanaDevnet:
    case Chain.ZoraTestnet:
      return true;
    default:
      return false;
  }
};

/**
 * Checks if a protocol address is valid.
 * @param protocolAddress The protocol address
 */
export const isValidProtocol = (protocolAddress: string): boolean => {
  const checkSumAddress = ethers.utils.getAddress(protocolAddress);
  const validProtocolAddresses = [CROSS_CHAIN_SEAPORT_V1_5_ADDRESS].map(
    (address) => ethers.utils.getAddress(address),
  );
  return validProtocolAddresses.includes(checkSumAddress);
};
