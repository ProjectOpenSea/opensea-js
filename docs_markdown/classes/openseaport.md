[opensea-js](../README.md) > [OpenSeaPort](../classes/openseaport.md)

# Class: OpenSeaPort

## Hierarchy

**OpenSeaPort**

## Index

### Constructors

* [constructor](openseaport.md#constructor)

### Properties

* [api](openseaport.md#api)
* [logger](openseaport.md#logger)
* [web3](openseaport.md#web3)

### Methods

* [_atomicMatch](openseaport.md#_atomicmatch)
* [_getProxy](openseaport.md#_getproxy)
* [_getTokenBalance](openseaport.md#_gettokenbalance)
* [_initializeProxy](openseaport.md#_initializeproxy)
* [_signOrder](openseaport.md#_signorder)
* [_validateAndPostOrder](openseaport.md#_validateandpostorder)
* [_validateBuyOrderParameters](openseaport.md#_validatebuyorderparameters)
* [_validateSellOrderParameters](openseaport.md#_validatesellorderparameters)
* [addListener](openseaport.md#addlistener)
* [approveFungibleToken](openseaport.md#approvefungibletoken)
* [approveNonFungibleToken](openseaport.md#approvenonfungibletoken)
* [cancelOrder](openseaport.md#cancelorder)
* [createBuyOrder](openseaport.md#createbuyorder)
* [createSellOrder](openseaport.md#createsellorder)
* [fulfillOrder](openseaport.md#fulfillorder)
* [getApprovedTokenCount](openseaport.md#getapprovedtokencount)
* [getCurrentPrice](openseaport.md#getcurrentprice)
* [removeAllListeners](openseaport.md#removealllisteners)
* [removeListener](openseaport.md#removelistener)
* [unwrapWeth](openseaport.md#unwrapweth)
* [wrapEth](openseaport.md#wrapeth)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new OpenSeaPort**(provider: *`Provider`*, apiConfig?: *[OpenSeaAPIConfig](../interfaces/openseaapiconfig.md)*, logger?: * `undefined` &#124; `function`*): [OpenSeaPort](openseaport.md)

*Defined in [seaport.ts:26](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L26)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| provider | `Provider` | - |
| `Default value` apiConfig | [OpenSeaAPIConfig](../interfaces/openseaapiconfig.md) |  {} |
| `Optional` logger |  `undefined` &#124; `function`| - |

**Returns:** [OpenSeaPort](openseaport.md)

___

## Properties

<a id="api"></a>

###  api

**● api**: *[OpenSeaAPI](openseaapi.md)*

*Defined in [seaport.ts:22](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L22)*

___
<a id="logger"></a>

###  logger

**● logger**: *`function`*

*Defined in [seaport.ts:21](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L21)*

#### Type declaration
▸(arg: *`string`*): `void`

**Parameters:**

| Param | Type |
| ------ | ------ |
| arg | `string` |

**Returns:** `void`

___
<a id="web3"></a>

###  web3

**● web3**: *`Web3`*

*Defined in [seaport.ts:20](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L20)*

___

## Methods

<a id="_atomicmatch"></a>

###  _atomicMatch

▸ **_atomicMatch**(__namedParameters: *`object`*): `Promise`<`string`>

*Defined in [seaport.ts:542](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L542)*

Helper methods

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`string`>

___
<a id="_getproxy"></a>

###  _getProxy

▸ **_getProxy**(accountAddress: *`string`*): `Promise`< `string` &#124; `null`>

*Defined in [seaport.ts:660](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L660)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| accountAddress | `string` |

**Returns:** `Promise`< `string` &#124; `null`>

___
<a id="_gettokenbalance"></a>

###  _getTokenBalance

▸ **_getTokenBalance**(__namedParameters: *`object`*): `Promise`<`BigNumber`>

*Defined in [seaport.ts:797](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L797)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`BigNumber`>

___
<a id="_initializeproxy"></a>

###  _initializeProxy

▸ **_initializeProxy**(accountAddress: *`string`*): `Promise`<`string`>

*Defined in [seaport.ts:674](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L674)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| accountAddress | `string` |

**Returns:** `Promise`<`string`>

___
<a id="_signorder"></a>

###  _signOrder

▸ **_signOrder**(order: *`object`*): `Promise`<`ECSignature`>

*Defined in [seaport.ts:857](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L857)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| order | `object` |

**Returns:** `Promise`<`ECSignature`>

___
<a id="_validateandpostorder"></a>

###  _validateAndPostOrder

▸ **_validateAndPostOrder**(order: *[Order](../interfaces/order.md)*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [seaport.ts:814](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L814)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| order | [Order](../interfaces/order.md) |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="_validatebuyorderparameters"></a>

###  _validateBuyOrderParameters

▸ **_validateBuyOrderParameters**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:746](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L746)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="_validatesellorderparameters"></a>

###  _validateSellOrderParameters

▸ **_validateSellOrderParameters**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:694](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L694)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="addlistener"></a>

###  addListener

▸ **addListener**(event: *[EventType](../enums/eventtype.md)*, listener: *`function`*, once?: *`boolean`*): `EventSubscription`

*Defined in [seaport.ts:59](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L59)*

Add a listener to a marketplace event

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| event | [EventType](../enums/eventtype.md) | - |  An event to listen for |
| listener | `function` | - |  A callback that will accept an object with event data |
| `Default value` once | `boolean` | false |  Whether the listener should only be called once |

**Returns:** `EventSubscription`

___
<a id="approvefungibletoken"></a>

###  approveFungibleToken

▸ **approveFungibleToken**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:498](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L498)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="approvenonfungibletoken"></a>

###  approveNonFungibleToken

▸ **approveNonFungibleToken**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:378](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L378)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="cancelorder"></a>

###  cancelOrder

▸ **cancelOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:339](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L339)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="createbuyorder"></a>

###  createBuyOrder

▸ **createBuyOrder**(__namedParameters: *`object`*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [seaport.ts:156](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L156)*

Create a buy order to make an offer on an asset. Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer. If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` and `ApproveCurrencyComplete` events before and after asking for approval.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="createsellorder"></a>

###  createSellOrder

▸ **createSellOrder**(__namedParameters: *`object`*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [seaport.ts:229](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L229)*

Create a sell order to auction an asset. Will throw a 'You do not own this asset' error if the maker doesn't have the asset. If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` and `ApproveAllAssetsComplete` events (or ApproveAsset and ApproveAssetComplete if the contract doesn't support approve-all) before and after asking for approval.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="fulfillorder"></a>

###  fulfillOrder

▸ **fulfillOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:304](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L304)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="getapprovedtokencount"></a>

###  getApprovedTokenCount

▸ **getApprovedTokenCount**(__namedParameters: *`object`*): `Promise`<`BigNumber`>

*Defined in [seaport.ts:364](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L364)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`BigNumber`>

___
<a id="getcurrentprice"></a>

###  getCurrentPrice

▸ **getCurrentPrice**(order: *[Order](../interfaces/order.md)*): `Promise`<`BigNumber`>

*Defined in [seaport.ts:521](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L521)*

Gets the price for the order using the contract

**Parameters:**

| Param | Type |
| ------ | ------ |
| order | [Order](../interfaces/order.md) |

**Returns:** `Promise`<`BigNumber`>

___
<a id="removealllisteners"></a>

###  removeAllListeners

▸ **removeAllListeners**(event?: *[EventType](../enums/eventtype.md)*): `void`

*Defined in [seaport.ts:85](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L85)*

Remove all event listeners. Good idea to call this when you're unmounting a component that listens to events to make UI updates

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| `Optional` event | [EventType](../enums/eventtype.md) |  Optional EventType to remove listeners for |

**Returns:** `void`

___
<a id="removelistener"></a>

###  removeListener

▸ **removeListener**(subscription: *`EventSubscription`*): `void`

*Defined in [seaport.ts:71](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L71)*

Remove an event listener, included here for completeness. Simply calls `.remove()` on a subscription

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| subscription | `EventSubscription` |  The event subscription returned from \`addListener\` |

**Returns:** `void`

___
<a id="unwrapweth"></a>

###  unwrapWeth

▸ **unwrapWeth**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:125](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L125)*

Unwrap W-ETH into ETH. Emits the `UnrapWeth` event when the transaction is ready, and the `UnwrapWethComplete` event when the blockchain confirms it.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="wrapeth"></a>

###  wrapEth

▸ **wrapEth**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:95](https://github.com/ProjectOpenSea/opensea-js/blob/3acb1cb/src/seaport.ts#L95)*

Wrap ETH into W-ETH. W-ETH is needed for placing buy orders (making offers). Emits the `WrapEth` event when the transaction is ready, and the `WrapEthComplete` event when the blockchain confirms it.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___

