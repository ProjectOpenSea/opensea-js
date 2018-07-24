import {
  assert,
} from 'chai';

import {
  suite,
  test,
} from 'mocha-typescript';

import OpenSea from '../src/index';

// import * as ordersAndHashesJSON from './ordersAndHashes.json';
// const ordersAndHashes = ordersAndHashesJSON as any;

// suite('basic', () => {
//   test('Null address is correct', () => {
//     assert.equal(OpenSea.NULL_ADDRESS, '0x0000000000000000000000000000000000000000');
//   });

//   test('Max uint256 is correct', () => {
//     assert.equal(OpenSea.MAX_UINT_256.toString(), '115792089237316195423570985008687907853269984665640564039457584007913129639935');
//   });

//   ordersAndHashes.map((orderAndHash: any, index: number) => {
//     test('Order #' + index + ' hash is correct', () => {
//       const hash = OpenSea.getOrderHashHex(orderAndHash.order);
//       assert.equal(hash, orderAndHash.hash);
//     });
//   });

//   test('First replacementPattern encoding is correct', () => {
//     const annotatedABI = {
//       type: AbiType.Function,
//       name: 'testFunction',
//       target: '',
//       inputs: [
//       ],
//       outputs: [
//       ],
//       constant: false,
//       stateMutability: StateMutability.Payable,
//       payable: true,
//     };
//     const encoded = OpenSea.encodeReplacementPattern(annotatedABI);
//     assert.equal(encoded, '0x00000000');
//     const methodID = '0x' + ethABI.methodID('testFunction', []).toString('hex');
//     assert.equal(methodID, '0xe16b4a9b');
//   });

//   test('Second complex replacementPattern encoding is correct', () => {
//     const annotatedABI = {
//       type: AbiType.Function,
//       name: 'testFunction',
//       target: '',
//       inputs: [
//         {
//           name: 'index',
//           type: 'uint256',
//           kind: FunctionInputKind.Replaceable,
//         },
//       ],
//       outputs: [
//       ],
//       constant: false,
//       stateMutability: StateMutability.Payable,
//       payable: true,
//     };
//     const encoded = OpenSea.encodeReplacementPattern(annotatedABI);
//     assert.equal(encoded, '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
//   });

//   test('Third replacementPattern encoding is correct', () => {
//     const annotatedABI = {
//       type: AbiType.Function,
//       name: 'testFunction',
//       target: '',
//       inputs: [
//         {
//           name: 'index',
//           type: 'uint256',
//           kind: FunctionInputKind.Replaceable,
//         },
//         {
//           name: 'address',
//           type: 'address',
//           kind: FunctionInputKind.Owner,
//         },
//       ],
//       outputs: [
//       ],
//       constant: false,
//       stateMutability: StateMutability.Payable,
//       payable: true,
//     };
//     const encoded = OpenSea.encodeReplacementPattern(annotatedABI);
//     assert.equal(encoded, '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000');
//   });

//   test('Fourth replacementPattern encoding is correct', () => {
//     const annotatedABI = {
//       type: AbiType.Function,
//       name: 'testFunction',
//       target: '',
//       inputs: [
//         {
//           name: 'index',
//           type: 'uint256',
//           kind: FunctionInputKind.Replaceable,
//         },
//         {
//           name: 'addr',
//           type: 'address',
//           kind: FunctionInputKind.Owner,
//         },
//         {
//           name: 'bytes',
//           type: 'bytes32',
//           kind: FunctionInputKind.Replaceable,
//         },
//       ],
//       outputs: [
//       ],
//       constant: false,
//       stateMutability: StateMutability.Payable,
//       payable: true,
//     };
//     const encoded = OpenSea.encodeReplacementPattern(annotatedABI);
//     assert.equal(encoded, '0x00000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
//   });

// });
