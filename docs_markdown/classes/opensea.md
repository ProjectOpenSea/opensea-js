[opensea-js](../README.md) > [OpenSea](../classes/opensea.md)

# Class: OpenSea

## Hierarchy

**OpenSea**

## Index

### Constructors

* [constructor](opensea.md#constructor)

### Properties

* [logger](opensea.md#logger)
* [web3](opensea.md#web3)

### Methods

* [_atomicMatch](opensea.md#_atomicmatch)
* [_dispatch](opensea.md#_dispatch)
* [_getProxy](opensea.md#_getproxy)
* [_getSchema](opensea.md#_getschema)
* [_getTokenBalance](opensea.md#_gettokenbalance)
* [_initializeProxy](opensea.md#_initializeproxy)
* [_makeMatchingOrder](opensea.md#_makematchingorder)
* [_signOrder](opensea.md#_signorder)
* [_validateAndPostOrder](opensea.md#_validateandpostorder)
* [_validateBuyOrderParameters](opensea.md#_validatebuyorderparameters)
* [_validateSellOrderParameters](opensea.md#_validatesellorderparameters)
* [addListener](opensea.md#addlistener)
* [approveFungibleToken](opensea.md#approvefungibletoken)
* [approveNonFungibleToken](opensea.md#approvenonfungibletoken)
* [cancelOrder](opensea.md#cancelorder)
* [createBuyOrder](opensea.md#createbuyorder)
* [createSellOrder](opensea.md#createsellorder)
* [fulfillOrder](opensea.md#fulfillorder)
* [getApprovedTokenCount](opensea.md#getapprovedtokencount)
* [getCurrentPrice](opensea.md#getcurrentprice)
* [removeAllListeners](opensea.md#removealllisteners)
* [removeListener](opensea.md#removelistener)
* [unwrapWeth](opensea.md#unwrapweth)
* [wrapEth](opensea.md#wrapeth)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new OpenSea**(provider: *`Provider`*, apiConfig?: *[OpenSeaAPIConfig](../interfaces/openseaapiconfig.md)*, logger?: * `undefined` &#124; `function`*): [OpenSea](opensea.md)

*Defined in [index.ts:27](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L27)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| provider | `Provider` | - |
| `Default value` apiConfig | [OpenSeaAPIConfig](../interfaces/openseaapiconfig.md) |  {} |
| `Optional` logger |  `undefined` &#124; `function`| - |

**Returns:** [OpenSea](opensea.md)

___

## Properties

<a id="logger"></a>

###  logger

**● logger**: *`function`*

*Defined in [index.ts:22](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L22)*

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

*Defined in [index.ts:21](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L21)*

___

## Methods

<a id="_atomicmatch"></a>

###  _atomicMatch

▸ **_atomicMatch**(__namedParameters: *`object`*): `Promise`<`string`>

*Defined in [index.ts:511](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L511)*

Helper methods

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`string`>

___
<a id="_dispatch"></a>

###  _dispatch

▸ **_dispatch**(event: *[EventType](../enums/eventtype.md)*, data: *[EventData](../interfaces/eventdata.md)*): `void`

*Defined in [index.ts:887](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L887)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| event | [EventType](../enums/eventtype.md) |
| data | [EventData](../interfaces/eventdata.md) |

**Returns:** `void`

___
<a id="_getproxy"></a>

###  _getProxy

▸ **_getProxy**(accountAddress: *`string`*): `Promise`< `string` &#124; `null`>

*Defined in [index.ts:672](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L672)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| accountAddress | `string` |

**Returns:** `Promise`< `string` &#124; `null`>

___
<a id="_getschema"></a>

###  _getSchema

▸ **_getSchema**(schemaName?: *`ERC721`*): `Schema`

*Defined in [index.ts:878](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L878)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| `Default value` schemaName | `ERC721` |  SchemaName.ERC721 |

**Returns:** `Schema`

___
<a id="_gettokenbalance"></a>

###  _getTokenBalance

▸ **_getTokenBalance**(__namedParameters: *`object`*): `Promise`<`BigNumber`>

*Defined in [index.ts:809](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L809)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`BigNumber`>

___
<a id="_initializeproxy"></a>

###  _initializeProxy

▸ **_initializeProxy**(accountAddress: *`string`*): `Promise`<`string`>

*Defined in [index.ts:686](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L686)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| accountAddress | `string` |

**Returns:** `Promise`<`string`>

___
<a id="_makematchingorder"></a>

###  _makeMatchingOrder

▸ **_makeMatchingOrder**(__namedParameters: *`object`*): [UnsignedOrder](../interfaces/unsignedorder.md)

*Defined in [index.ts:628](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L628)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** [UnsignedOrder](../interfaces/unsignedorder.md)

___
<a id="_signorder"></a>

###  _signOrder

▸ **_signOrder**(order: *`object`*): `Promise`<`ECSignature`>

*Defined in [index.ts:868](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L868)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| order | `object` |

**Returns:** `Promise`<`ECSignature`>

___
<a id="_validateandpostorder"></a>

###  _validateAndPostOrder

▸ **_validateAndPostOrder**(order: *[Order](../interfaces/order.md)*): `Promise`<`void`>

*Defined in [index.ts:826](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L826)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| order | [Order](../interfaces/order.md) |

**Returns:** `Promise`<`void`>

___
<a id="_validatebuyorderparameters"></a>

###  _validateBuyOrderParameters

▸ **_validateBuyOrderParameters**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:758](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L758)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="_validatesellorderparameters"></a>

###  _validateSellOrderParameters

▸ **_validateSellOrderParameters**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:706](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L706)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="addlistener"></a>

###  addListener

▸ **addListener**(event: *[EventType](../enums/eventtype.md)*, listener: *`function`*, once?: *`boolean`*): `EventSubscription`

*Defined in [index.ts:60](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L60)*

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

*Defined in [index.ts:471](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L471)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`Object`>

___
<a id="approvenonfungibletoken"></a>

###  approveNonFungibleToken

▸ **approveNonFungibleToken**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:351](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L351)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="cancelorder"></a>

###  cancelOrder

▸ **cancelOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:312](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L312)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="createbuyorder"></a>

###  createBuyOrder

▸ **createBuyOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:135](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L135)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="createsellorder"></a>

###  createSellOrder

▸ **createSellOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:202](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L202)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="fulfillorder"></a>

###  fulfillOrder

▸ **fulfillOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:277](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L277)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="getapprovedtokencount"></a>

###  getApprovedTokenCount

▸ **getApprovedTokenCount**(__namedParameters: *`object`*): `Promise`<`BigNumber`>

*Defined in [index.ts:337](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L337)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`BigNumber`>

___
<a id="getcurrentprice"></a>

###  getCurrentPrice

▸ **getCurrentPrice**(order: *[Order](../interfaces/order.md)*): `Promise`<`BigNumber`>

*Defined in [index.ts:490](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L490)*

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

*Defined in [index.ts:81](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L81)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` event | [EventType](../enums/eventtype.md) |

**Returns:** `void`

___
<a id="removelistener"></a>

###  removeListener

▸ **removeListener**(subscription: *`EventSubscription`*): `void`

*Defined in [index.ts:72](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L72)*

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

*Defined in [index.ts:110](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L110)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="wrapeth"></a>

###  wrapEth

▸ **wrapEth**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:85](https://github.com/ProjectOpenSea/opensea-js/blob/3f1bc52/src/index.ts#L85)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___

