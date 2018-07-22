const OpenSea = require('../index')
const Web3 = require('web3')
const provider = new Web3.providers.HttpProvider('https://mainnet.infura.io')

const client = new OpenSea(provider, {networkName: "main"})

async function main() {
  await client.wrapEth({amountInEth: 1, accountAddress: "0x"})
}

try {
  main()
} catch(error) {
  console.error(error)
}
