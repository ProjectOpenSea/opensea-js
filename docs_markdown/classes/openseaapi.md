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

*Defined in [api.ts:23](https://github.com/ProjectOpenSea/opensea-js/blob/d48b650/src/api.ts#L23)*

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

*Defined in [api.ts:17](https://github.com/ProjectOpenSea/opensea-js/blob/d48b650/src/api.ts#L17)*

Base url for the API

___
<a id="pagesize"></a>

###  pageSize

**● pageSize**: *`number`* = 20

*Defined in [api.ts:21](https://github.com/ProjectOpenSea/opensea-js/blob/d48b650/src/api.ts#L21)*

Page size to use for fetching orders

___

## Methods

<a id="get"></a>

###  get

▸ **get**(apiPath: *`string`*, query?: *`object`*): `Promise`<`Response`>

*Defined in [api.ts:124](https://github.com/ProjectOpenSea/opensea-js/blob/d48b650/src/api.ts#L124)*

Get JSON data from API, sending auth token in headers

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| apiPath | `string` | - |  Path to URL endpoint under API |
| `Default value` query | `object` |  {} |  Data to send. Will be stringified using QueryString |

**Returns:** `Promise`<`Response`>

___
<a id="getorder"></a>

###  getOrder

▸ **getOrder**(query: *`Partial`<[OrderJSON](../interfaces/orderjson.md)>*): `Promise`< [Order](../interfaces/order.md) &#124; `null`>

*Defined in [api.ts:65](https://github.com/ProjectOpenSea/opensea-js/blob/d48b650/src/api.ts#L65)*

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

*Defined in [api.ts:90](https://github.com/ProjectOpenSea/opensea-js/blob/d48b650/src/api.ts#L90)*

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

*Defined in [api.ts:139](https://github.com/ProjectOpenSea/opensea-js/blob/d48b650/src/api.ts#L139)*

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

*Defined in [api.ts:50](https://github.com/ProjectOpenSea/opensea-js/blob/d48b650/src/api.ts#L50)*

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

*Defined in [api.ts:161](https://github.com/ProjectOpenSea/opensea-js/blob/d48b650/src/api.ts#L161)*

PUT JSON data to API, sending auth token in headers

**Parameters:**

| Param | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| apiPath | `string` | - |  Path to URL endpoint under API |
| body | `object` | - |  Data to send |
| `Default value` opts | `RequestInit` |  {} |  RequestInit opts, similar to Fetch API. If it contains a body, it won't be stringified. |

**Returns:** `Promise`<`Response`>

___

