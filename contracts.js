export const getMethod = (abi, name) => {
  return abi.filter(x => x.type === 'function' && x.name === name)[0]
}
  
export const event = (abi, name) => {
  return abi.filter(x => x.type === 'event' && x.name === name)[0]
}

export const DECENTRALAND_AUCTION_CONFIG = {
  "1": "0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d"
}

export const ERC20 = require('./abi/ERC20.json')
export const ERC721 = require('./abi/ERC721v3.json')
export const CanonicalWETH = require('./abi/CanonicalWETH.json')