// NO IMPORTS HERE
// Should be top-level

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
