// Taken from wyvern and 0x
declare module 'web3_beta'
declare module 'web3-provider-engine'
declare module 'web3-provider-engine/subproviders/rpc'

/* tslint:enable */

declare module '*.json' {
    const json: any
    /* tslint:disable */
    export default json;
    /* tslint:enable */
}

// truffle-hdwallet-provider declarations
declare module 'truffle-hdwallet-provider' {
    import * as Web3 from 'web3'
    class HDWalletProvider implements Web3.Provider {
        constructor(mnemonic: string, rpcUrl: string);
        public sendAsync(
            payload: Web3.JSONRPCRequestPayload,
            callback: (err: Error, result: Web3.JSONRPCResponsePayload) => void,
        ): void
    }
    export = HDWalletProvider
}
