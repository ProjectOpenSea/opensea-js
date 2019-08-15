import { PartialReadonlyContractAbi } from './types'
import { AbiType, MethodAbi, EventAbi } from 'web3'

export const getMethod = (abi: PartialReadonlyContractAbi, name: string): MethodAbi => {
  const methodAbi = abi.find(x => x.type == AbiType.Function && x.name == name)
  if (!methodAbi) {
    throw new Error(`ABI ${name} not found`)
  }
  // Have to cast since there's a bug in
  // web3 types on the 'type' field
  return methodAbi as MethodAbi
}

export const event = (abi: PartialReadonlyContractAbi, name: string): EventAbi => {
  const eventAbi = abi.find(x => x.type == AbiType.Event && x.name == name)
  if (!eventAbi) {
    throw new Error(`ABI ${name} not found`)
  }
  // Have to cast since there's a bug in
  // web3 types on the 'type' field
  return eventAbi as EventAbi
}

export const DECENTRALAND_AUCTION_CONFIG = {
  '1': '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d',
}

export { ERC20 } from './abi/ERC20'
export { ERC721 } from './abi/ERC721v3'
export { ERC1155 } from './abi/ERC1155'
export { CanonicalWETH } from './abi/CanonicalWETH'
export { WrappedNFT } from './abi/WrappedNFT'
export { WrappedNFTFactory } from './abi/WrappedNFTFactory'
export { WrappedNFTLiquidationProxy } from './abi/WrappedNFTLiquidationProxy'
export { UniswapFactory } from './abi/UniswapFactory'
export { UniswapExchange } from './abi/UniswapExchange'
