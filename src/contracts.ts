import { PartialReadonlyContractAbi } from './types'
import { AbiType, MethodAbi, EventAbi } from 'web3'

export const getMethod = (abi: PartialReadonlyContractAbi, name: string): MethodAbi => {
  // Have to cast since there's a bug in
  // web3 types on the 'type' field
  return abi.filter(x => x.type == AbiType.Function && x.name == name)[0] as MethodAbi
}

export const event = (abi: PartialReadonlyContractAbi, name: string): EventAbi => {
  // Have to cast since there's a bug in
  // web3 types on the 'type' field
  return abi.filter(x => x.type == AbiType.Event && x.name == name)[0] as EventAbi
}

export const DECENTRALAND_AUCTION_CONFIG = {
  '1': '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d',
}

export { ERC20 } from './abi/ERC20'
export { ERC721 } from './abi/ERC721v3'
export { ERC1155 } from './abi/ERC1155'
export { CanonicalWETH } from './abi/CanonicalWETH'
