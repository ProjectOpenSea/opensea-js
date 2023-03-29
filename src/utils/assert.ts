/* Sourced from 0x.js */

import { assert as sharedAssert } from "@0x/assert";
// We need those two unused imports because they're actually used by sharedAssert which gets injected here
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { schemas } from "@0x/json-schemas";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BigNumber } from "@0x/utils";
import { Web3Wrapper } from "@0x/web3-wrapper";
import * as ethUtil from "ethereumjs-util";
import * as _ from "lodash";
import { ECSignature } from "../types";

/* Sourced from: https://github.com/ProjectOpenSea/wyvern-js/blob/master/src/utils/assert.ts */
export const assert = {
  ...sharedAssert,
  isValidSignature(
    orderHash: string,
    ecSignature: ECSignature,
    signerAddress: string
  ) {
    const isValidSignature = signatureUtils.isValidSignature(
      orderHash,
      ecSignature,
      signerAddress
    );
    this.assert(
      isValidSignature,
      `Expected order with hash '${orderHash}' to have a valid signature`
    );
  },
  async isSenderAddressAsync(
    variableName: string,
    senderAddressHex: string,
    web3Wrapper: Web3Wrapper
  ): Promise<void> {
    sharedAssert.isETHAddressHex(variableName, senderAddressHex);
    const isSenderAddressAvailable =
      await web3Wrapper.isSenderAddressAvailableAsync(senderAddressHex);
    sharedAssert.assert(
      isSenderAddressAvailable,
      `Specified ${variableName} ${senderAddressHex} isn't available through the supplied web3 provider`
    );
  },
  async isUserAddressAvailableAsync(web3Wrapper: Web3Wrapper): Promise<void> {
    const availableAddresses = await web3Wrapper.getAvailableAddressesAsync();
    this.assert(
      !_.isEmpty(availableAddresses),
      "No addresses were available on the provided web3 provider"
    );
  },
};

/* Sourced from https://github.com/ProjectOpenSea/wyvern-js/blob/master/src/utils/signature_utils.ts */
const signatureUtils = {
  isValidSignature(
    data: string,
    signature: ECSignature,
    signerAddress: string
  ): boolean {
    const dataBuff = ethUtil.toBuffer(data);
    // const msgHashBuff = ethUtil.hashPersonalMessage(dataBuff);
    const msgHashBuff = dataBuff;
    try {
      const pubKey = ethUtil.ecrecover(
        msgHashBuff,
        signature.v,
        ethUtil.toBuffer(signature.r),
        ethUtil.toBuffer(signature.s)
      );
      const retrievedAddress = ethUtil.bufferToHex(
        ethUtil.pubToAddress(pubKey)
      );
      return retrievedAddress === signerAddress;
    } catch (err) {
      return false;
    }
  },
  parseSignatureHexAsVRS(signatureHex: string): ECSignature {
    const signatureBuffer = ethUtil.toBuffer(signatureHex);
    let v = +ethUtil.bufferToHex(signatureBuffer.slice(0, 1));
    if (v < 27) {
      v += 27;
    }
    const r = signatureBuffer.slice(1, 33);
    const s = signatureBuffer.slice(33, 65);
    const ecSignature: ECSignature = {
      v,
      r: ethUtil.bufferToHex(r),
      s: ethUtil.bufferToHex(s),
    };
    return ecSignature;
  },
  parseSignatureHexAsRSV(signatureHex: string): ECSignature {
    const { v, r, s } = ethUtil.fromRpcSig(signatureHex);
    const ecSignature: ECSignature = {
      v,
      r: ethUtil.bufferToHex(r),
      s: ethUtil.bufferToHex(s),
    };
    return ecSignature;
  },
};
