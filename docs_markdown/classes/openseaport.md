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

*Defined in [seaport.ts:26](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L26)*

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

*Defined in [seaport.ts:22](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L22)*

___
<a id="logger"></a>

###  logger

**● logger**: *`function`*

*Defined in [seaport.ts:21](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L21)*

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

*Defined in [seaport.ts:20](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L20)*

___

## Methods

<a id="_atomicmatch"></a>

###  _atomicMatch

▸ **_atomicMatch**(__namedParameters: *`object`*): `Promise`<`string`>

*Defined in [seaport.ts:510](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L510)*

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

*Defined in [seaport.ts:628](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L628)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| accountAddress | `string` |

**Returns:** `Promise`< `string` &#124; `null`>

___
<a id="_gettokenbalance"></a>

###  _getTokenBalance

▸ **_getTokenBalance**(__namedParameters: *`object`*): `Promise`<`BigNumber`>

*Defined in [seaport.ts:765](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L765)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`BigNumber`>

___
<a id="_initializeproxy"></a>

###  _initializeProxy

▸ **_initializeProxy**(accountAddress: *`string`*): `Promise`<`string`>

*Defined in [seaport.ts:642](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L642)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| accountAddress | `string` |

**Returns:** `Promise`<`string`>

___
<a id="_signorder"></a>

###  _signOrder

▸ **_signOrder**(order: *`object`*): `Promise`<`ECSignature`>

*Defined in [seaport.ts:825](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L825)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| order | `object` |

**Returns:** `Promise`<`ECSignature`>

___
<a id="_validateandpostorder"></a>

###  _validateAndPostOrder

▸ **_validateAndPostOrder**(order: *[Order](../interfaces/order.md)*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [seaport.ts:782](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L782)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| order | [Order](../interfaces/order.md) |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="_validatebuyorderparameters"></a>

###  _validateBuyOrderParameters

▸ **_validateBuyOrderParameters**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:714](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L714)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="_validatesellorderparameters"></a>

###  _validateSellOrderParameters

▸ **_validateSellOrderParameters**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:662](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L662)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="addlistener"></a>

###  addListener

▸ **addListener**(event: *[EventType](../enums/eventtype.md)*, listener: *`function`*, once?: *`boolean`*): `EventSubscription`

*Defined in [seaport.ts:59](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L59)*

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

▸ **approveFungibleToken**(__namedParameters: *`object`*): `Promise`<`Object`>

*Defined in [seaport.ts:470](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L470)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`Object`>

___
<a id="approvenonfungibletoken"></a>

###  approveNonFungibleToken

▸ **approveNonFungibleToken**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:350](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L350)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="cancelorder"></a>

###  cancelOrder

▸ **cancelOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:311](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L311)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="createbuyorder"></a>

###  createBuyOrder

▸ **createBuyOrder**(__namedParameters: *`object`*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [seaport.ts:134](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L134)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="createsellorder"></a>

###  createSellOrder

▸ **createSellOrder**(__namedParameters: *`object`*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [seaport.ts:201](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L201)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="fulfillorder"></a>

###  fulfillOrder

▸ **fulfillOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:276](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L276)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="getapprovedtokencount"></a>

###  getApprovedTokenCount

▸ **getApprovedTokenCount**(__namedParameters: *`object`*): `Promise`<`BigNumber`>

*Defined in [seaport.ts:336](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L336)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`BigNumber`>

___
<a id="getcurrentprice"></a>

###  getCurrentPrice

▸ **getCurrentPrice**(order: *[Order](../interfaces/order.md)*): `Promise`<`BigNumber`>

*Defined in [seaport.ts:489](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L489)*

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

*Defined in [seaport.ts:80](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L80)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` event | [EventType](../enums/eventtype.md) |

**Returns:** `void`

___
<a id="removelistener"></a>

###  removeListener

▸ **removeListener**(subscription: *`EventSubscription`*): `void`

*Defined in [seaport.ts:71](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L71)*

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

*Defined in [seaport.ts:109](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L109)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="wrapeth"></a>

###  wrapEth

▸ **wrapEth**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:84](https://github.com/ProjectOpenSea/opensea-js/blob/4352cbd/src/seaport.ts#L84)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___

