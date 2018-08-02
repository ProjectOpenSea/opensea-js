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

* [getOrder](openseaapi.md#getorder)
* [getOrders](openseaapi.md#getorders)
* [postOrder](openseaapi.md#postorder)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new OpenSeaAPI**(__namedParameters: *`object`*): [OpenSeaAPI](openseaapi.md)

*Defined in [api.ts:17](https://github.com/ProjectOpenSea/opensea-js/blob/4a31548/src/api.ts#L17)*

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

*Defined in [api.ts:14](https://github.com/ProjectOpenSea/opensea-js/blob/4a31548/src/api.ts#L14)*

___
<a id="pagesize"></a>

###  pageSize

**● pageSize**: *`number`* = 20

*Defined in [api.ts:15](https://github.com/ProjectOpenSea/opensea-js/blob/4a31548/src/api.ts#L15)*

___

## Methods

<a id="getorder"></a>

###  getOrder

▸ **getOrder**(query: *`Partial`<[OrderJSON](../interfaces/orderjson.md)>*): `Promise`< [Order](../interfaces/order.md) &#124; `null`>

*Defined in [api.ts:43](https://github.com/ProjectOpenSea/opensea-js/blob/4a31548/src/api.ts#L43)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| query | `Partial`<[OrderJSON](../interfaces/orderjson.md)> |

**Returns:** `Promise`< [Order](../interfaces/order.md) &#124; `null`>

___
<a id="getorders"></a>

###  getOrders

▸ **getOrders**(query?: *`Partial`<[OrderJSON](../interfaces/orderjson.md)>*, page?: *`number`*): `Promise`<`object`>

*Defined in [api.ts:61](https://github.com/ProjectOpenSea/opensea-js/blob/4a31548/src/api.ts#L61)*

**Parameters:**

| Param | Type | Default value |
| ------ | ------ | ------ |
| `Default value` query | `Partial`<[OrderJSON](../interfaces/orderjson.md)> |  {} |
| `Default value` page | `number` | 1 |

**Returns:** `Promise`<`object`>

___
<a id="postorder"></a>

###  postOrder

▸ **postOrder**(order: *[OrderJSON](../interfaces/orderjson.md)*): `Promise`<[Order](../interfaces/order.md)>

*Defined in [api.ts:33](https://github.com/ProjectOpenSea/opensea-js/blob/4a31548/src/api.ts#L33)*

**Parameters:**

| Param | Type |
| ------ | ------ |
| order | [OrderJSON](../interfaces/orderjson.md) |

**Returns:** `Promise`<[Order](../interfaces/order.md)>

___

