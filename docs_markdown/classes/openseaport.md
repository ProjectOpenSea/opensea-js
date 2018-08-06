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

* [_getApprovedTokenCount](openseaport.md#_getapprovedtokencount)
* [_getProxy](openseaport.md#_getproxy)
* [_getTokenBalance](openseaport.md#_gettokenbalance)
* [_initializeProxy](openseaport.md#_initializeproxy)
* [addListener](openseaport.md#addlistener)
* [approveFungibleToken](openseaport.md#approvefungibletoken)
* [approveNonFungibleToken](openseaport.md#approvenonfungibletoken)
* [cancelOrder](openseaport.md#cancelorder)
* [createBuyOrder](openseaport.md#createbuyorder)
* [createSellOrder](openseaport.md#createsellorder)
* [fulfillOrder](openseaport.md#fulfillorder)
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

*Defined in [seaport.ts:26](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L26)*

Your very own seaport. Create a new instance of OpenSeaJS.

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| provider | `Provider` | - |  Web3 Provider to use for transactions. For example: `const provider = new Web3.providers.HttpProvider('[https://mainnet.infura.io')&#x60](https://mainnet.infura.io')&#x60); |
| `Default value` apiConfig | [OpenSeaAPIConfig](../interfaces/openseaapiconfig.md) |  {} |  configuration options, including \`networkName\` |
| `Optional` logger |  `undefined` &#124; `function`| - |  logger, optional, a function that will be called with debugging information |

**Returns:** [OpenSeaPort](openseaport.md)

___

## Properties

<a id="api"></a>

###  api

**● api**: *[OpenSeaAPI](openseaapi.md)*

*Defined in [seaport.ts:22](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L22)*

___
<a id="logger"></a>

###  logger

**● logger**: *`function`*

*Defined in [seaport.ts:21](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L21)*

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

*Defined in [seaport.ts:20](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L20)*

___

## Methods

<a id="_getapprovedtokencount"></a>

###  _getApprovedTokenCount

▸ **_getApprovedTokenCount**(__namedParameters: *`object`*): `Promise`<`BigNumber`>

*Defined in [seaport.ts:646](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L646)*

For a fungible token to use in trades (like W-ETH), get the amount approved for use by the Wyvern transfer proxy. Internal method exposed for dev flexibility.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`BigNumber`>

___
<a id="_getproxy"></a>

###  _getProxy

▸ **_getProxy**(accountAddress: *`string`*): `Promise`< `string` &#124; `null`>

*Defined in [seaport.ts:573](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L573)*

Get the proxy address for a user's wallet. Internal method exposed for dev flexibility.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| accountAddress | `string` |  The user's wallet address |

**Returns:** `Promise`< `string` &#124; `null`>

___
<a id="_gettokenbalance"></a>

###  _getTokenBalance

▸ **_getTokenBalance**(__namedParameters: *`object`*): `Promise`<`BigNumber`>

*Defined in [seaport.ts:622](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L622)*

Get the balance of a fungible token. Internal method exposed for dev flexibility.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`BigNumber`>

___
<a id="_initializeproxy"></a>

###  _initializeProxy

▸ **_initializeProxy**(accountAddress: *`string`*): `Promise`<`string`>

*Defined in [seaport.ts:594](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L594)*

Initialize the proxy for a user's wallet. Proxies are used to make trades on behalf of the order's maker so that trades can happen when the maker isn't online. Internal method exposed for dev flexibility.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| accountAddress | `string` |  The user's wallet address |

**Returns:** `Promise`<`string`>

___
<a id="addlistener"></a>

###  addListener

▸ **addListener**(event: *[EventType](../enums/eventtype.md)*, listener: *`function`*, once?: *`boolean`*): `EventSubscription`

*Defined in [seaport.ts:68](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L68)*

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

*Defined in [seaport.ts:528](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L528)*

Approve a fungible token (e.g. W-ETH) for use in trades. Called internally, but exposed for dev flexibility.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="approvenonfungibletoken"></a>

###  approveNonFungibleToken

▸ **approveNonFungibleToken**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:406](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L406)*

Approve a non-fungible token for use in trades. Called internally, but exposed for dev flexibility.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="cancelorder"></a>

###  cancelOrder

▸ **cancelOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:369](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L369)*

Cancel an order on-chain, preventing it from ever being fulfilled.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="createbuyorder"></a>

###  createBuyOrder

▸ **createBuyOrder**(__namedParameters: *`object`*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [seaport.ts:168](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L168)*

Create a buy order to make an offer on an asset. Will throw an 'Insufficient balance' error if the maker doesn't have enough W-ETH to make the offer. If the user hasn't approved W-ETH access yet, this will emit `ApproveCurrency` before asking for approval.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="createsellorder"></a>

###  createSellOrder

▸ **createSellOrder**(__namedParameters: *`object`*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [seaport.ts:248](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L248)*

Create a sell order to auction an asset. Will throw a 'You do not own this asset' error if the maker doesn't have the asset. If the user hasn't approved access to the token yet, this will emit `ApproveAllAssets` (or `ApproveAsset` if the contract doesn't support approve-all) before asking for approval.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="fulfillorder"></a>

###  fulfillOrder

▸ **fulfillOrder**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:330](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L330)*

Fullfill or "take" an order for an asset, either a buy or sell order

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="getcurrentprice"></a>

###  getCurrentPrice

▸ **getCurrentPrice**(order: *[Order](../interfaces/order.md)*): `Promise`<`BigNumber`>

*Defined in [seaport.ts:551](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L551)*

Gets the price for the order using the contract

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| order | [Order](../interfaces/order.md) |  The order to calculate the price for |

**Returns:** `Promise`<`BigNumber`>

___
<a id="removealllisteners"></a>

###  removeAllListeners

▸ **removeAllListeners**(event?: *[EventType](../enums/eventtype.md)*): `void`

*Defined in [seaport.ts:94](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L94)*

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

*Defined in [seaport.ts:80](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L80)*

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

*Defined in [seaport.ts:135](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L135)*

Unwrap W-ETH into ETH. Emits the `UnwrapWeth` event when the transaction is prompted.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___
<a id="wrapeth"></a>

###  wrapEth

▸ **wrapEth**(__namedParameters: *`object`*): `Promise`<`void`>

*Defined in [seaport.ts:106](https://github.com/ProjectOpenSea/opensea-js/blob/e845296/src/seaport.ts#L106)*

Wrap ETH into W-ETH. W-ETH is needed for placing buy orders (making offers). Emits the `WrapEth` event when the transaction is prompted.

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** `Promise`<`void`>

___

