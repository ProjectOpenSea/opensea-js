[opensea-js](../README.md) > [OpenSeaAPI](../classes/openseaapi.md)

# Class: OpenSeaAPI

## Hierarchy

**OpenSeaAPI**

## Index

### Constructors

* [constructor](openseaapi.md#constructor)

### Properties

* [apiBaseUrl](openseaapi.md#apibaseurl)
* [pageSize](openseaapi.md#pagesize)

### Methods

* [get](openseaapi.md#get)
* [getAsset](openseaapi.md#getasset)
* [getAssets](openseaapi.md#getassets)
* [getOrder](openseaapi.md#getorder)
* [getOrders](openseaapi.md#getorders)
* [post](openseaapi.md#post)
* [postOrder](openseaapi.md#postorder)
* [put](openseaapi.md#put)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new OpenSeaAPI**(__namedParameters: *`object`*): [OpenSeaAPI](openseaapi.md)

*Defined in [api.ts:25](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L25)*

Create an instance of the OpenSea API

**Parameters:**

| Param | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** [OpenSeaAPI](openseaapi.md)

___

## Properties

<a id="apibaseurl"></a>

###  apiBaseUrl

**● apiBaseUrl**: *`string`*

*Defined in [api.ts:19](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L19)*

Base url for the API

___
<a id="pagesize"></a>

###  pageSize

**● pageSize**: *`number`* = 20

*Defined in [api.ts:23](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L23)*

Page size to use for fetching orders

___

## Methods

<a id="get"></a>

###  get

▸ **get**(apiPath: *`string`*, query?: *`object`*): `Promise`<`Response`>

*Defined in [api.ts:162](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L162)*

Get JSON data from API, sending auth token in headers

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| apiPath | `string` | - |  Path to URL endpoint under API |
| `Default value` query | `object` |  {} |  Data to send. Will be stringified using QueryString |

**Returns:** `Promise`<`Response`>

___
<a id="getasset"></a>

###  getAsset

▸ **getAsset**(tokenAddress: *`string`*, tokenId: * `string` &#124; `number`*): `Promise`< [OpenSeaAsset](../interfaces/openseaasset.md) &#124; `null`>

*Defined in [api.ts:126](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L126)*

Fetch an asset from the API, return null if it isn't found

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| tokenAddress | `string` |  Address of the asset's contract |
| tokenId |  `string` &#124; `number`|  The asset's token ID |

**Returns:** `Promise`< [OpenSeaAsset](../interfaces/openseaasset.md) &#124; `null`>

___
<a id="getassets"></a>

###  getAssets

▸ **getAssets**(query?: *`Partial`<[OpenSeaAssetJSON](../interfaces/openseaassetjson.md)>*, page?: *`number`*): `Promise`<`object`>

*Defined in [api.ts:139](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L139)*

Fetch list of assets from the API, returning the page of assets and the count of total assets

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Default value` query | `Partial`<[OpenSeaAssetJSON](../interfaces/openseaassetjson.md)> |  {} |  Query to use for getting orders. A subset of parameters on the \`AssetJSON\` type is supported |
| `Default value` page | `number` | 1 |  Page number, defaults to 1 |

**Returns:** `Promise`<`object`>

___
<a id="getorder"></a>

###  getOrder

▸ **getOrder**(query: *`Partial`<[OrderJSON](../interfaces/orderjson.md)>*): `Promise`< [Order](../interfaces/order.md) &#124; `null`>

*Defined in [api.ts:67](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L67)*

Get an order from the orderbook, returning `null` if none are found.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| query | `Partial`<[OrderJSON](../interfaces/orderjson.md)> |  Query to use for getting orders. A subset of parameters on the \`OrderJSON\` type is supported |

**Returns:** `Promise`< [Order](../interfaces/order.md) &#124; `null`>

___
<a id="getorders"></a>

###  getOrders

▸ **getOrders**(query?: *`Partial`<[OrderJSON](../interfaces/orderjson.md)>*, page?: *`number`*): `Promise`<`object`>

*Defined in [api.ts:92](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L92)*

Get a list of orders from the orderbook, returning the page of orders and the count of total orders found.

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Default value` query | `Partial`<[OrderJSON](../interfaces/orderjson.md)> |  {} |  Query to use for getting orders. A subset of parameters on the \`OrderJSON\` type is supported |
| `Default value` page | `number` | 1 |  Page number, defaults to 1 |

**Returns:** `Promise`<`object`>

___
<a id="post"></a>

###  post

▸ **post**(apiPath: *`string`*, body?: * `undefined` &#124; `object`*, opts?: *`RequestInit`*): `Promise`<`Response`>

*Defined in [api.ts:177](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L177)*

POST JSON data to API, sending auth token in headers

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| apiPath | `string` | - |  Path to URL endpoint under API |
| `Optional` body |  `undefined` &#124; `object`| - |  Data to send. Will be JSON.stringified |
| `Default value` opts | `RequestInit` |  {} |  RequestInit opts, similar to Fetch API. If it contains a body, it won't be stringified. |

**Returns:** `Promise`<`Response`>

___
<a id="postorder"></a>

###  postOrder

▸ **postOrder**(order: *[OrderJSON](../interfaces/orderjson.md)*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [api.ts:52](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L52)*

Send an order to the orderbook. Throws when the order is invalid.

**Parameters:**

| Param | Type | Description |
| ------ | ------ | ------ |
| order | [OrderJSON](../interfaces/orderjson.md) |  Order to post to the orderbook |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___
<a id="put"></a>

###  put

▸ **put**(apiPath: *`string`*, body: *`object`*, opts?: *`RequestInit`*): `Promise`<`Response`>

*Defined in [api.ts:199](https://github.com/ProjectOpenSea/opensea-js/blob/780e919/src/api.ts#L199)*

PUT JSON data to API, sending auth token in headers

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| apiPath | `string` | - |  Path to URL endpoint under API |
| body | `object` | - |  Data to send |
| `Default value` opts | `RequestInit` |  {} |  RequestInit opts, similar to Fetch API. If it contains a body, it won't be stringified. |

**Returns:** `Promise`<`Response`>

___

