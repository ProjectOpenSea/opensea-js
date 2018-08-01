[opensea-js](../README.md) > [OpenSeaPort](../classes/openseaport.md)

# Class: OpenSeaPort

## Hierarchy

**OpenSeaPort**

## Index

### Constructors

* [constructor](openseaport.md#constructor)

### Properties

* [logger](openseaport.md#logger)
* [web3](openseaport.md#web3)

### Methods

* [_atomicMatch](openseaport.md#_atomicmatch)
* [_dispatch](openseaport.md#_dispatch)
* [_getProxy](openseaport.md#_getproxy)
* [_getSchema](openseaport.md#_getschema)
* [_getTokenBalance](openseaport.md#_gettokenbalance)
* [_initializeProxy](openseaport.md#_initializeproxy)
* [_makeMatchingOrder](openseaport.md#_makematchingorder)
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

*Defined in [index.ts:27](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L27)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| provider | `Provider` | - |
| `Default value` apiConfig | [OpenSeaAPIConfig](../interfaces/openseaapiconfig.md) |  {} |
| `Optional` logger |  `undefined` &#124; `function`| - |

**Returns:** [OpenSeaPort](openseaport.md)

___

## Properties

<a id="logger"></a>

###  logger

**● logger**: *`function`*

*Defined in [index.ts:22](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L22)*

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

*Defined in [index.ts:21](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L21)*

___

## Methods

<a id="_atomicmatch"></a>

###  _atomicMatch

▸ **_atomicMatch**(__namedParameters: *`object`*): `Promise`<`string`>

*Defined in [index.ts:511](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L511)*

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

*Defined in [index.ts:888](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L888)*

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

*Defined in [index.ts:672](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L672)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| accountAddress | `string` |

**Returns:** `Promise`< `string` &#124; `null`>

___
<a id="_getschema"></a>

###  _getSchema

▸ **_getSchema**(schemaName?: *`ERC721`*): `Schema`

*Defined in [index.ts:879](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L879)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| `Default value` schemaName | `ERC721` |  SchemaName.ERC721 |

**Returns:** `Schema`

___
<a id="_gettokenbalance"></a>

###  _getTokenBalance

▸ **_getTokenBalance**(__namedParameters: *`object`*): `Promise`<`BigNumber`>

*Defined in [index.ts:809](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L809)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`BigNumber`>

___
<a id="_initializeproxy"></a>

###  _initializeProxy

▸ **_initializeProxy**(accountAddress: *`string`*): `Promise`<`string`>

*Defined in [index.ts:686](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L686)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| accountAddress | `string` |

**Returns:** `Promise`<`string`>

___
<a id="_makematchingorder"></a>

###  _makeMatchingOrder

▸ **_makeMatchingOrder**(__namedParameters: *`object`*): [UnsignedOrder](../interfaces/unsignedorder.md)

*Defined in [index.ts:628](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L628)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** [UnsignedOrder](../interfaces/unsignedorder.md)

___
<a id="_signorder"></a>

###  _signOrder

▸ **_signOrder**(order: *`object`*): `Promise`<`ECSignature`>

*Defined in [index.ts:869](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L869)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| order | `object` |

**Returns:** `Promise`<`ECSignature`>

___
<a id="_validateandpostorder"></a>

###  _validateAndPostOrder

▸ **_validateAndPostOrder**(order: *[Order](../interfaces/order.md)*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [index.ts:826](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L826)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| order | [Order](../interfaces/order.md) |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="_validatebuyorderparameters"></a>

###  _validateBuyOrderParameters

▸ **_validateBuyOrderParameters**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:758](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L758)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="_validatesellorderparameters"></a>

###  _validateSellOrderParameters

▸ **_validateSellOrderParameters**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:706](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L706)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="addlistener"></a>

###  addListener

▸ **addListener**(event: *[EventType](../enums/eventtype.md)*, listener: *`function`*, once?: *`boolean`*): `EventSubscription`

*Defined in [index.ts:60](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L60)*

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

*Defined in [index.ts:471](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L471)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`Object`>

___
<a id="approvenonfungibletoken"></a>

###  approveNonFungibleToken

▸ **approveNonFungibleToken**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:351](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L351)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="cancelorder"></a>

###  cancelOrder

▸ **cancelOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:312](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L312)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="createbuyorder"></a>

###  createBuyOrder

▸ **createBuyOrder**(__namedParameters: *`object`*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [index.ts:135](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L135)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="createsellorder"></a>

###  createSellOrder

▸ **createSellOrder**(__namedParameters: *`object`*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [index.ts:202](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L202)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="fulfillorder"></a>

###  fulfillOrder

▸ **fulfillOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:277](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L277)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="getapprovedtokencount"></a>

###  getApprovedTokenCount

▸ **getApprovedTokenCount**(__namedParameters: *`object`*): `Promise`<`BigNumber`>

*Defined in [index.ts:337](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L337)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`BigNumber`>

___
<a id="getcurrentprice"></a>

###  getCurrentPrice

▸ **getCurrentPrice**(order: *[Order](../interfaces/order.md)*): `Promise`<`BigNumber`>

*Defined in [index.ts:490](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L490)*

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

*Defined in [index.ts:81](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L81)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| `Optional` event | [EventType](../enums/eventtype.md) |

**Returns:** `void`

___
<a id="removelistener"></a>

###  removeListener

▸ **removeListener**(subscription: *`EventSubscription`*): `void`

*Defined in [index.ts:72](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L72)*

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

*Defined in [index.ts:110](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L110)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="wrapeth"></a>

###  wrapEth

▸ **wrapEth**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [index.ts:85](https://github.com/ProjectOpenSea/opensea-js/blob/d1fd63a/src/index.ts#L85)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___

