import { ItemType } from "@opensea/seaport-js/lib/constants";
import BigNumber from "bignumber.js";
import { AbiType, CallData, TxData } from "ethereum-types";
import * as ethUtil from "ethereumjs-util";
import * as _ from "lodash";
import Web3 from "web3";
import { JsonRpcResponse } from "web3-core-helpers/types";
import { AbstractProvider } from "web3-core/types";
import { Contract } from "web3-eth-contract";
import { WyvernProtocol } from "wyvern-js";
import {
  AnnotatedFunctionABI,
  FunctionInputKind,
  FunctionOutputKind,
  Network,
  Schema,
  StateMutability,
} from "wyvern-schemas/dist/types";
import {
  ENJIN_ADDRESS,
  ENJIN_COIN_ADDRESS,
  INVERSE_BASIS_POINT,
  MAX_EXPIRATION_MONTHS,
  MERKLE_VALIDATOR_MAINNET,
  MERKLE_VALIDATOR_RINKEBY,
  NULL_ADDRESS,
  NULL_BLOCK_HASH,
  SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS,
  SHARED_STORE_FRONT_ADDRESS_MAINNET,
  SHARED_STORE_FRONT_ADDRESS_RINKEBY,
} from "../constants";
import { ERC1155 } from "../contracts";
import { ERC1155Abi } from "../typechain/contracts/ERC1155Abi";
import {
  Asset,
  AssetEvent,
  ECSignature,
  OpenSeaAccount,
  OpenSeaAsset,
  OpenSeaAssetBundle,
  OpenSeaAssetContract,
  OpenSeaCollection,
  OpenSeaFungibleToken,
  OpenSeaTraitStats,
  OpenSeaUser,
  Order,
  OrderJSON,
  OrderSide,
  SaleKind,
  Transaction,
  TxnCallback,
  UnhashedOrder,
  UnsignedOrder,
  Web3Callback,
  WyvernAsset,
  WyvernBundle,
  WyvernFTAsset,
  WyvernNFTAsset,
  WyvernSchemaName,
} from "../types";

export { WyvernProtocol };

export const annotateERC721TransferABI = (
  asset: WyvernNFTAsset
): AnnotatedFunctionABI => ({
  constant: false,
  inputs: [
    {
      name: "_to",
      type: "address",
      kind: FunctionInputKind.Replaceable,
    },
    {
      name: "_tokenId",
      type: "uint256",
      kind: FunctionInputKind.Asset,
      value: asset.id,
    },
  ],
  target: asset.address,
  name: "transfer",
  outputs: [],
  payable: false,
  stateMutability: StateMutability.Nonpayable,
  type: AbiType.Function,
});

export const annotateERC20TransferABI = (
  asset: WyvernFTAsset
): AnnotatedFunctionABI => ({
  constant: false,
  inputs: [
    {
      name: "_to",
      type: "address",
      kind: FunctionInputKind.Replaceable,
    },
    {
      name: "_amount",
      type: "uint256",
      kind: FunctionInputKind.Count,
      value: asset.quantity,
    },
  ],
  target: asset.address,
  name: "transfer",
  outputs: [
    {
      name: "success",
      type: "bool",
      kind: FunctionOutputKind.Other,
    },
  ],
  payable: false,
  stateMutability: StateMutability.Nonpayable,
  type: AbiType.Function,
});

// OTHER

const txCallbacks: { [key: string]: TxnCallback[] } = {};

/**
 * Promisify a callback-syntax web3 function
 * @param inner callback function that accepts a Web3 callback function and passes
 * it to the Web3 function
 */
async function promisify<T>(inner: (fn: Web3Callback<T>) => void) {
  return new Promise<T>((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    })
  );
}

/**
 * Promisify a call a method on a contract,
 * handling Parity errors. Returns '0x' if error.
 * Note that if T is not "string", this may return a falsey
 * value when the contract doesn't support the method (e.g. `isApprovedForAll`).
 * @param callback An anonymous function that takes a web3 callback
 * and returns a Web3 Contract's call result, e.g. `c => erc721.ownerOf(3, c)`
 * @param onError callback when user denies transaction
 */
export async function promisifyCall<T>(
  callback: (fn: Web3Callback<T>) => T,
  onError?: (error: unknown) => void
): Promise<T | undefined> {
  try {
    const result = await promisify<T>(callback);
    if (typeof result === "string" && result == "0x") {
      // Geth compatibility
      return undefined;
    }
    return result as T;
  } catch (error) {
    // Probably method not found, and web3 is a Parity node
    if (onError) {
      onError(error);
    } else {
      console.error(error);
    }
    return undefined;
  }
}

const track = (web3: Web3, txHash: string, onFinalized: TxnCallback) => {
  if (txCallbacks[txHash]) {
    txCallbacks[txHash].push(onFinalized);
  } else {
    txCallbacks[txHash] = [onFinalized];
    const poll = async () => {
      const tx = await web3.eth.getTransaction(txHash);
      if (tx && tx.blockHash && tx.blockHash !== NULL_BLOCK_HASH) {
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        if (!receipt) {
          // Hack: assume success if no receipt
          console.warn("No receipt found for ", txHash);
        }
        const status = receipt.status;
        txCallbacks[txHash].map((f) => f(status));
        delete txCallbacks[txHash];
      } else {
        setTimeout(poll, 1000);
      }
    };
    poll().catch();
  }
};

export const confirmTransaction = async (web3: Web3, txHash: string) => {
  return new Promise((resolve, reject) => {
    track(web3, txHash, (didSucceed: boolean) => {
      if (didSucceed) {
        resolve("Transaction complete!");
      } else {
        reject(
          new Error(
            `Transaction failed :( You might have already completed this action. See more on the mainnet at etherscan.io/tx/${txHash}`
          )
        );
      }
    });
  });
};

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
    orders: asset.orders ? asset.orders.map(orderFromJSON) : null,
    sellOrders: asset.sell_orders ? asset.sell_orders.map(orderFromJSON) : null,
    buyOrders: asset.buy_orders ? asset.buy_orders.map(orderFromJSON) : null,

    isPresale: asset.is_presale,
    // Don't use previews if it's a special image
    imageUrl:
      isAnimated || isSvg
        ? asset.image_url
        : asset.image_preview_url || asset.image_url,
    imagePreviewUrl: asset.image_preview_url,
    imageUrlOriginal: asset.image_original_url,
    imageUrlThumbnail: asset.image_thumbnail_url,

    externalLink: asset.external_link,
    openseaLink: asset.permalink,
    traits: asset.traits,
    numSales: asset.num_sales,
    lastSale: asset.last_sale ? assetEventFromJSON(asset.last_sale) : null,
    backgroundColor: asset.background_color
      ? `#${asset.background_color}`
      : null,

    transferFee: asset.transfer_fee ? makeBigNumber(asset.transfer_fee) : null,
    transferFeePaymentToken: asset.transfer_fee_payment_token
      ? tokenFromJSON(asset.transfer_fee_payment_token)
      : null,
  };
  // If orders were included, put them in sell/buy order groups
  if (fromJSON.orders && !fromJSON.sellOrders) {
    fromJSON.sellOrders = fromJSON.orders.filter(
      (o) => o.side == OrderSide.Sell
    );
  }
  if (fromJSON.orders && !fromJSON.buyOrders) {
    fromJSON.buyOrders = fromJSON.orders.filter((o) => o.side == OrderSide.Buy);
  }
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

    sellOrders: asset_bundle.sell_orders
      ? asset_bundle.sell_orders.map(orderFromJSON)
      : null,
  };

  return fromJSON;
};

export const assetContractFromJSON = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asset_contract: any
): OpenSeaAssetContract => {
  return {
    name: asset_contract.name,
    description: asset_contract.description,
    type: asset_contract.asset_contract_type,
    schemaName: asset_contract.schema_name,
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
    paymentTokens: (collection.payment_tokens || []).map(tokenFromJSON),
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
      openseaFees: new Map(Object.entries(collection.fees.opensea_fees || {})),
      sellerFees: new Map(Object.entries(collection.fees.seller_fees || {})),
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const orderFromJSON = (order: any): Order => {
  const createdDate = new Date(`${order.created_date}Z`);

  const fromJSON: Order = {
    hash: order.order_hash || order.hash,
    cancelledOrFinalized: order.cancelled || order.finalized,
    markedInvalid: order.marked_invalid,
    metadata: order.metadata,
    quantity: new BigNumber(order.quantity || 1),
    exchange: order.exchange,
    makerAccount: order.maker,
    takerAccount: order.taker,
    // Use string address to conform to Wyvern Order schema
    maker: order.maker.address,
    taker: order.taker.address,
    makerRelayerFee: new BigNumber(order.maker_relayer_fee),
    takerRelayerFee: new BigNumber(order.taker_relayer_fee),
    makerProtocolFee: new BigNumber(order.maker_protocol_fee),
    takerProtocolFee: new BigNumber(order.taker_protocol_fee),
    makerReferrerFee: new BigNumber(order.maker_referrer_fee || 0),
    waitingForBestCounterOrder: order.fee_recipient.address == NULL_ADDRESS,
    feeMethod: order.fee_method,
    feeRecipientAccount: order.fee_recipient,
    feeRecipient: order.fee_recipient.address,
    side: order.side,
    saleKind: order.sale_kind,
    target: order.target,
    howToCall: order.how_to_call,
    calldata: order.calldata,
    replacementPattern: order.replacement_pattern,
    staticTarget: order.static_target,
    staticExtradata: order.static_extradata,
    paymentToken: order.payment_token,
    basePrice: new BigNumber(order.base_price),
    extra: new BigNumber(order.extra),
    currentBounty: new BigNumber(order.current_bounty || 0),
    currentPrice: new BigNumber(order.current_price || 0),

    createdTime: new BigNumber(Math.round(createdDate.getTime() / 1000)),
    listingTime: new BigNumber(order.listing_time),
    expirationTime: new BigNumber(order.expiration_time),

    salt: new BigNumber(order.salt),
    v: parseInt(order.v),
    r: order.r,
    s: order.s,

    paymentTokenContract: order.payment_token_contract
      ? tokenFromJSON(order.payment_token_contract)
      : undefined,
    asset: order.asset ? assetFromJSON(order.asset) : undefined,
    assetBundle: order.asset_bundle
      ? assetBundleFromJSON(order.asset_bundle)
      : undefined,
  };

  // Use client-side price calc, to account for buyer fee (not added by server) and latency
  fromJSON.currentPrice = estimateCurrentPrice(fromJSON);

  return fromJSON;
};

/**
 * Convert an order to JSON, hashing it as well if necessary
 * @param order order (hashed or unhashed)
 */
export const orderToJSON = (order: Order): OrderJSON => {
  const asJSON: OrderJSON = {
    exchange: order.exchange.toLowerCase(),
    maker: order.maker.toLowerCase(),
    taker: order.taker.toLowerCase(),
    makerRelayerFee: order.makerRelayerFee.toString(),
    takerRelayerFee: order.takerRelayerFee.toString(),
    makerProtocolFee: order.makerProtocolFee.toString(),
    takerProtocolFee: order.takerProtocolFee.toString(),
    makerReferrerFee: order.makerReferrerFee.toString(),
    feeMethod: order.feeMethod,
    feeRecipient: order.feeRecipient.toLowerCase(),
    side: order.side,
    saleKind: order.saleKind,
    target: order.target.toLowerCase(),
    howToCall: order.howToCall,
    calldata: order.calldata,
    replacementPattern: order.replacementPattern,
    staticTarget: order.staticTarget.toLowerCase(),
    staticExtradata: order.staticExtradata,
    paymentToken: order.paymentToken.toLowerCase(),
    quantity: order.quantity.toString(),
    basePrice: order.basePrice.toString(),
    englishAuctionReservePrice: order.englishAuctionReservePrice
      ? order.englishAuctionReservePrice.toString()
      : undefined,
    extra: order.extra.toString(),
    createdTime: order.createdTime ? order.createdTime.toString() : undefined,
    listingTime: order.listingTime.toString(),
    expirationTime: order.expirationTime.toString(),
    salt: order.salt.toString(),

    metadata: order.metadata,

    v: order.v,
    r: order.r,
    s: order.s,

    nonce: order.nonce,
  };
  return asJSON;
};

/**
 * Sign messages using web3 personal signatures
 * @param web3 Web3 instance
 * @param message message to sign
 * @param signerAddress web3 address signing the message
 * @returns A signature if provider can sign, otherwise null
 */
export async function personalSignAsync(
  web3: Web3,
  message: string,
  signerAddress: string
): Promise<ECSignature> {
  const signature = await promisify<JsonRpcResponse | undefined>((c) =>
    (web3.currentProvider as AbstractProvider).sendAsync(
      {
        method: "personal_sign",
        params: [message, signerAddress],
        from: signerAddress,
        id: new Date().getTime(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      c
    )
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (signature as any).error;
  if (error) {
    throw new Error(error);
  }

  return parseSignatureHex(signature?.result);
}

/**
 * Sign messages using web3 signTypedData signatures
 * @param web3 Web3 instance
 * @param message message to sign
 * @param signerAddress web3 address signing the message
 * @returns A signature if provider can sign, otherwise null
 */
export async function signTypedDataAsync(
  web3: Web3,
  message: object,
  signerAddress: string
): Promise<ECSignature> {
  let signature: JsonRpcResponse | undefined;
  try {
    // Using sign typed data V4 works with a stringified message, used by browser providers i.e. Metamask
    signature = await promisify<JsonRpcResponse | undefined>((c) =>
      (web3.currentProvider as AbstractProvider).sendAsync(
        {
          method: "eth_signTypedData_v4",
          params: [signerAddress, JSON.stringify(message)],
          from: signerAddress,
          id: new Date().getTime(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        c
      )
    );
  } catch {
    // Fallback to normal sign typed data for node providers, without using stringified message
    // https://github.com/coinbase/coinbase-wallet-sdk/issues/60
    signature = await promisify<JsonRpcResponse | undefined>((c) =>
      (web3.currentProvider as AbstractProvider).sendAsync(
        {
          method: "eth_signTypedData",
          params: [signerAddress, message],
          from: signerAddress,
          id: new Date().getTime(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        c
      )
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (signature as any).error;
  if (error) {
    throw new Error(error);
  }

  return parseSignatureHex(signature?.result);
}

/**
 * Checks whether a given address contains any code
 * @param web3 Web3 instance
 * @param address input address
 */
export async function isContractAddress(
  web3: Web3,
  address: string
): Promise<boolean> {
  const code = await web3.eth.getCode(address);
  return code !== "0x";
}

export type BigNumberInput = number | string | BigNumber;

/**
 * Special fixes for making BigNumbers using web3 results
 * @param arg An arg or the result of a web3 call to turn into a BigNumber
 */
export function makeBigNumber(arg: BigNumberInput): BigNumber {
  // Zero sometimes returned as 0x from contracts
  if (arg === "0x") {
    arg = 0;
  }
  // fix "new BigNumber() number type has more than 15 significant digits"
  arg = arg.toString();
  return new BigNumber(arg);
}

/**
 * Send a transaction to the blockchain and optionally confirm it
 * @param web3 Web3 instance
 * @param param0 __namedParameters
 * @param from address sending transaction
 * @param to destination contract address
 * @param data data to send to contract
 * @param gasPrice gas price to use. If unspecified, uses web3 default (mean gas price)
 * @param value value in ETH to send with data. Defaults to 0
 * @param onError callback when user denies transaction
 */
export async function sendRawTransaction(
  web3: Web3,
  { from, to, data, gasPrice, value = 0, gas }: TxData,
  onError: (error: unknown) => void
): Promise<string> {
  if (gas == null) {
    // This gas cannot be increased due to an ethjs error
    gas = await estimateGas(web3, { from, to, data, value });
  }

  try {
    const txHashRes = await promisify<string>((c) =>
      web3.eth.sendTransaction(
        {
          from,
          to,
          value: value.toString(),
          data,
          gas: gas?.toString(),
          gasPrice: gasPrice?.toString(),
        },
        c
      )
    );
    return txHashRes;
  } catch (error) {
    onError(error);
    throw error;
  }
}

/**
 * Call a method on a contract, sending arbitrary data and
 * handling Parity errors. Returns '0x' if error.
 * @param web3 Web3 instance
 * @param param0 __namedParameters
 * @param from address sending call
 * @param to destination contract address
 * @param data data to send to contract
 * @param onError callback when user denies transaction
 */
export async function rawCall(
  web3: Web3,
  { from, to, data }: CallData,
  onError?: (error: unknown) => void
): Promise<string> {
  try {
    const result = await web3.eth.call({
      from,
      to,
      data,
    });
    return result;
  } catch (error) {
    // Probably method not found, and web3 is a Parity node
    if (onError) {
      onError(error);
    }
    // Backwards compatibility with Geth nodes
    return "0x";
  }
}

/**
 * Estimate Gas usage for a transaction
 * @param web3 Web3 instance
 * @param from address sending transaction
 * @param to destination contract address
 * @param data data to send to contract
 * @param value value in ETH to send with data
 */
export async function estimateGas(
  web3: Web3,
  { from, to, data, value = 0 }: TxData
): Promise<number> {
  const amount = await web3.eth.estimateGas({
    from,
    to,
    value: value.toString(),
    data,
  });

  return amount;
}

/**
 * Get mean gas price for sending a txn, in wei
 * @param web3 Web3 instance
 */
export async function getCurrentGasPrice(web3: Web3): Promise<BigNumber> {
  const gasPrice = await web3.eth.getGasPrice();
  return new BigNumber(gasPrice);
}

/**
 * Get current transfer fees for an asset
 * @param web3 Web3 instance
 * @param asset The asset to check for transfer fees
 */
export async function getTransferFeeSettings(
  web3: Web3,
  {
    asset,
    accountAddress,
  }: {
    asset: Asset;
    accountAddress?: string;
  }
) {
  let transferFee: BigNumber | undefined;
  let transferFeeTokenAddress: string | undefined;

  if (asset.tokenAddress.toLowerCase() == ENJIN_ADDRESS.toLowerCase()) {
    // Enjin asset
    const feeContract = new web3.eth.Contract(
      ERC1155,
      asset.tokenAddress
    ) as unknown as ERC1155Abi;

    const params = await feeContract.methods
      .transferSettings(asset.tokenId as string)
      .call({ from: accountAddress });
    if (params) {
      transferFee = makeBigNumber(params[3]);
      if (params[2] === "0") {
        transferFeeTokenAddress = ENJIN_COIN_ADDRESS;
      }
    }
  }
  return { transferFee, transferFeeTokenAddress };
}

// sourced from 0x.js:
// https://github.com/ProjectWyvern/wyvern-js/blob/39999cb93ce5d80ea90b4382182d1bd4339a9c6c/src/utils/signature_utils.ts
function parseSignatureHex(signature: string): ECSignature {
  // HACK: There is no consensus on whether the signatureHex string should be formatted as
  // v + r + s OR r + s + v, and different clients (even different versions of the same client)
  // return the signature params in different orders. In order to support all client implementations,
  // we parse the signature in both ways, and evaluate if either one is a valid signature.
  const validVParamValues = [27, 28];

  const ecSignatureRSV = _parseSignatureHexAsRSV(signature);
  if (_.includes(validVParamValues, ecSignatureRSV.v)) {
    return ecSignatureRSV;
  }

  // For older clients
  const ecSignatureVRS = _parseSignatureHexAsVRS(signature);
  if (_.includes(validVParamValues, ecSignatureVRS.v)) {
    return ecSignatureVRS;
  }

  throw new Error("Invalid signature");

  function _parseSignatureHexAsVRS(signatureHex: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signatureBuffer: any = ethUtil.toBuffer(signatureHex);
    let v = signatureBuffer[0];
    if (v < 27) {
      v += 27;
    }
    const r = signatureBuffer.slice(1, 33);
    const s = signatureBuffer.slice(33, 65);
    const ecSignature = {
      v,
      r: ethUtil.bufferToHex(r),
      s: ethUtil.bufferToHex(s),
    };
    return ecSignature;
  }

  function _parseSignatureHexAsRSV(signatureHex: string) {
    const { v, r, s } = ethUtil.fromRpcSig(signatureHex);
    const ecSignature = {
      v,
      r: ethUtil.bufferToHex(r),
      s: ethUtil.bufferToHex(s),
    };
    return ecSignature;
  }
}

/**
 * Estimates the price of an order
 * @param order The order to estimate price on
 * @param secondsToBacktrack The number of seconds to subtract on current time,
 *  to fix race conditions
 * @param shouldRoundUp Whether to round up fractional wei
 */
export function estimateCurrentPrice(
  order: Order,
  secondsToBacktrack = 30,
  shouldRoundUp = true
) {
  let { basePrice, listingTime, expirationTime, extra } = order;
  const { side, takerRelayerFee, saleKind } = order;

  const now = new BigNumber(Math.round(Date.now() / 1000)).minus(
    secondsToBacktrack
  );
  basePrice = new BigNumber(basePrice);
  listingTime = new BigNumber(listingTime);
  expirationTime = new BigNumber(expirationTime);
  extra = new BigNumber(extra);

  let exactPrice = basePrice;

  if (saleKind === SaleKind.FixedPrice) {
    // Do nothing, price is correct
  } else if (saleKind === SaleKind.DutchAuction) {
    const diff = extra
      .times(now.minus(listingTime))
      .dividedBy(expirationTime.minus(listingTime));

    exactPrice =
      side == OrderSide.Sell
        ? /* Sell-side - start price: basePrice. End price: basePrice - extra. */
          basePrice.minus(diff)
        : /* Buy-side - start price: basePrice. End price: basePrice + extra. */
          basePrice.plus(diff);
  }

  // Add taker fee only for buyers
  if (side === OrderSide.Sell && !order.waitingForBestCounterOrder) {
    // Buyer fee increases sale price
    exactPrice = exactPrice.times(+takerRelayerFee / INVERSE_BASIS_POINT + 1);
  }

  return shouldRoundUp
    ? exactPrice.integerValue(BigNumber.ROUND_CEIL)
    : exactPrice;
}

/**
 * Get the Wyvern representation of a fungible asset
 * @param schema The WyvernSchema needed to access this asset
 * @param asset The asset to trade
 * @param quantity The number of items to trade
 */
export function getWyvernAsset(
  schema: Schema<WyvernAsset>,
  asset: Asset,
  quantity = new BigNumber(1)
): WyvernAsset {
  const tokenId = asset.tokenId != null ? asset.tokenId.toString() : undefined;

  return schema.assetFromFields({
    ID: tokenId,
    Quantity: quantity.toString(),
    Address: asset.tokenAddress.toLowerCase(),
    Name: asset.name,
  });
}

/**
 * Get the Wyvern representation of a group of assets
 * Sort order is enforced here. Throws if there's a duplicate.
 * @param assets Assets to bundle
 * @param schemas The WyvernSchemas needed to access each asset, respectively
 * @param quantities The quantity of each asset to bundle, respectively
 */
export function getWyvernBundle(
  assets: Asset[],
  schemas: Array<Schema<WyvernAsset>>,
  quantities: BigNumber[]
): WyvernBundle {
  if (assets.length != quantities.length) {
    throw new Error("Bundle must have a quantity for every asset");
  }

  if (assets.length != schemas.length) {
    throw new Error("Bundle must have a schema for every asset");
  }

  const wyAssets = assets.map((asset, i) =>
    getWyvernAsset(schemas[i], asset, quantities[i])
  );

  const sorters = [
    (assetAndSchema: { asset: WyvernAsset; schema: WyvernSchemaName }) =>
      assetAndSchema.asset.address,
    (assetAndSchema: { asset: WyvernAsset; schema: WyvernSchemaName }) =>
      assetAndSchema.asset.id || 0,
  ];

  const wyAssetsAndSchemas = wyAssets.map((asset, i) => ({
    asset,
    schema: schemas[i].name as WyvernSchemaName,
  }));

  const uniqueAssets = _.uniqBy(
    wyAssetsAndSchemas,
    (group) => `${sorters[0](group)}-${sorters[1](group)}`
  );

  if (uniqueAssets.length != wyAssetsAndSchemas.length) {
    throw new Error("Bundle can't contain duplicate assets");
  }

  const sortedWyAssetsAndSchemas = _.sortBy(wyAssetsAndSchemas, sorters);

  return {
    assets: sortedWyAssetsAndSchemas.map((group) => group.asset),
    schemas: sortedWyAssetsAndSchemas.map((group) => group.schema),
  };
}

/**
 * Get the non-prefixed hash for the order
 * (Fixes a Wyvern typescript issue and casing issue)
 * @param order order to hash
 */
export function getOrderHash(order: UnhashedOrder) {
  const orderWithStringTypes = {
    ...order,
    maker: order.maker.toLowerCase(),
    taker: order.taker.toLowerCase(),
    feeRecipient: order.feeRecipient.toLowerCase(),
    side: order.side.toString(),
    saleKind: order.saleKind.toString(),
    howToCall: order.howToCall.toString(),
    feeMethod: order.feeMethod.toString(),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return WyvernProtocol.getOrderHashHex(orderWithStringTypes as any);
}

/**
 * Assign an order and a new matching order to their buy/sell sides
 * @param order Original order
 * @param matchingOrder The result of _makeMatchingOrder
 */
export function assignOrdersToSides(
  order: Order,
  matchingOrder: UnsignedOrder
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
 * Validates that an address exists, isn't null, and is properly
 * formatted for Wyvern and OpenSea
 * @param address input address
 */
export function validateAndFormatWalletAddress(
  web3: Web3,
  address: string
): string {
  if (!address) {
    throw new Error("No wallet address found");
  }
  if (!web3.utils.isAddress(address)) {
    throw new Error("Invalid wallet address");
  }
  if (address == NULL_ADDRESS) {
    throw new Error("Wallet cannot be the null address");
  }
  return address.toLowerCase();
}

/**
 * Notify developer when a pattern will be deprecated
 * @param msg message to log to console
 */
export function onDeprecated(msg: string) {
  console.warn(`DEPRECATION NOTICE: ${msg}`);
}

/**
 * Get special-case approval addresses for an erc721 contract
 * @param erc721Contract contract to check
 */
export async function getNonCompliantApprovalAddress(
  erc721Contract: Contract,
  tokenId: string,
  _accountAddress: string
): Promise<string | undefined> {
  const results = await Promise.allSettled([
    // CRYPTOKITTIES check
    erc721Contract.methods.kittyIndexToApproved(tokenId).call(),
    // Etherbots check
    erc721Contract.methods.partIndexToApproved(tokenId).call(),
  ]);

  return _.compact(results)[0].status;
}

export const merkleValidatorByNetwork = {
  [Network.Main]: MERKLE_VALIDATOR_MAINNET,
  [Network.Rinkeby]: MERKLE_VALIDATOR_RINKEBY,
  [Network.Goerli]: null,
};

/**
 * The longest time that an order is valid for is six months from the current date
 * @returns unix timestamp
 */
export const getMaxOrderExpirationTimestamp = () => {
  const maxExpirationDate = new Date();

  maxExpirationDate.setMonth(
    maxExpirationDate.getMonth() + MAX_EXPIRATION_MONTHS
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

export const getAssetItemType = (schemaName?: WyvernSchemaName) => {
  switch (schemaName) {
    case "ERC20":
      return ItemType.ERC20;
    case "ERC721":
      return ItemType.ERC721;
    case "ERC1155":
      return ItemType.ERC1155;
    default:
      throw new Error(`Unknown schema name: ${schemaName}`);
  }
};

const SHARED_STOREFRONT_ADDRESSES = new Set([
  SHARED_STORE_FRONT_ADDRESS_MAINNET.toLowerCase(),
  SHARED_STORE_FRONT_ADDRESS_RINKEBY.toLowerCase(),
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
      ? SHARED_STOREFRONT_LAZY_MINT_ADAPTER_ADDRESS
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
  fees: Map<string, number> | undefined
): number => {
  if (!fees) {
    return 0;
  }

  return Array.from(fees.values()).reduce(
    (sum, basisPoints) => basisPoints + sum,
    0
  );
};
