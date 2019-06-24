import { PartialReadonlyContractAbi } from './types'

export const getMethod = (abi: PartialReadonlyContractAbi, name: string) => {
  return abi.filter(x => x.type == 'function' && x.name == name)[0]
}

export const event = (abi: PartialReadonlyContractAbi, name: string) => {
  return abi.filter(x => x.type == 'event' && x.name == name)[0]
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
