[opensea-js](../README.md) > [OrderJSON](../interfaces/orderjson.md)

# Interface: OrderJSON

## Hierarchy

**OrderJSON**

## Index

### Properties

* [asset_contract_address](orderjson.md#asset_contract_address)
* [basePrice](orderjson.md#baseprice)
* [calldata](orderjson.md#calldata)
* [exchange](orderjson.md#exchange)
* [expirationTime](orderjson.md#expirationtime)
* [extra](orderjson.md#extra)
* [feeMethod](orderjson.md#feemethod)
* [feeRecipient](orderjson.md#feerecipient)
* [hash](orderjson.md#hash)
* [howToCall](orderjson.md#howtocall)
* [limit](orderjson.md#limit)
* [listingTime](orderjson.md#listingtime)
* [maker](orderjson.md#maker)
* [makerProtocolFee](orderjson.md#makerprotocolfee)
* [makerRelayerFee](orderjson.md#makerrelayerfee)
* [metadata](orderjson.md#metadata)
* [offset](orderjson.md#offset)
* [owner](orderjson.md#owner)
* [paymentToken](orderjson.md#paymenttoken)
* [r](orderjson.md#r)
* [replacementPattern](orderjson.md#replacementpattern)
* [s](orderjson.md#s)
* [saleKind](orderjson.md#salekind)
* [salt](orderjson.md#salt)
* [side](orderjson.md#side)
* [staticExtradata](orderjson.md#staticextradata)
* [staticTarget](orderjson.md#statictarget)
* [taker](orderjson.md#taker)
* [takerProtocolFee](orderjson.md#takerprotocolfee)
* [takerRelayerFee](orderjson.md#takerrelayerfee)
* [target](orderjson.md#target)
* [token_id](orderjson.md#token_id)
* [v](orderjson.md#v)

---

## Properties

<a id="asset_contract_address"></a>

### `<Optional>` asset_contract_address

**● asset_contract_address**: * `undefined` &#124; `string`
*

*Defined in [types.ts:202](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L202)*

___
<a id="baseprice"></a>

###  basePrice

**● basePrice**: *`string`*

*Defined in [types.ts:183](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L183)*

___
<a id="calldata"></a>

###  calldata

**● calldata**: *`string`*

*Defined in [types.ts:178](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L178)*

___
<a id="exchange"></a>

###  exchange

**● exchange**: *`string`*

*Defined in [types.ts:165](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L165)*

___
<a id="expirationtime"></a>

###  expirationTime

**● expirationTime**: *`string`*

*Defined in [types.ts:186](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L186)*

___
<a id="extra"></a>

###  extra

**● extra**: *`string`*

*Defined in [types.ts:184](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L184)*

___
<a id="feemethod"></a>

###  feeMethod

**● feeMethod**: *[FeeMethod](../enums/feemethod.md)*

*Defined in [types.ts:173](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L173)*

___
<a id="feerecipient"></a>

###  feeRecipient

**● feeRecipient**: *`string`*

*Defined in [types.ts:172](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L172)*

___
<a id="hash"></a>

### `<Optional>` hash

**● hash**: * `undefined` &#124; `string`
*

*Defined in [types.ts:195](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L195)*

___
<a id="howtocall"></a>

###  howToCall

**● howToCall**: *`HowToCall`*

*Defined in [types.ts:177](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L177)*

___
<a id="limit"></a>

### `<Optional>` limit

**● limit**: * `undefined` &#124; `number`
*

*Defined in [types.ts:204](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L204)*

___
<a id="listingtime"></a>

###  listingTime

**● listingTime**: *`string`*

*Defined in [types.ts:185](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L185)*

___
<a id="maker"></a>

###  maker

**● maker**: *`string`*

*Defined in [types.ts:166](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L166)*

___
<a id="makerprotocolfee"></a>

###  makerProtocolFee

**● makerProtocolFee**: *`string`*

*Defined in [types.ts:170](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L170)*

___
<a id="makerrelayerfee"></a>

###  makerRelayerFee

**● makerRelayerFee**: *`string`*

*Defined in [types.ts:168](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L168)*

___
<a id="metadata"></a>

###  metadata

**● metadata**: *`object`*

*Defined in [types.ts:189](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L189)*

#### Type declaration

 asset: [WyvernAsset](wyvernasset.md)

 schema: [WyvernSchemaName](../enums/wyvernschemaname.md)

___
<a id="offset"></a>

### `<Optional>` offset

**● offset**: * `undefined` &#124; `number`
*

*Defined in [types.ts:205](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L205)*

___
<a id="owner"></a>

### `<Optional>` owner

**● owner**: * `undefined` &#124; `string`
*

*Defined in [types.ts:201](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L201)*

___
<a id="paymenttoken"></a>

###  paymentToken

**● paymentToken**: *`string`*

*Defined in [types.ts:182](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L182)*

___
<a id="r"></a>

### `<Optional>` r

**● r**: * `undefined` &#124; `string`
*

*Defined in [types.ts:197](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L197)*

___
<a id="replacementpattern"></a>

###  replacementPattern

**● replacementPattern**: *`string`*

*Defined in [types.ts:179](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L179)*

___
<a id="s"></a>

### `<Optional>` s

**● s**: * `undefined` &#124; `string`
*

*Defined in [types.ts:198](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L198)*

___
<a id="salekind"></a>

###  saleKind

**● saleKind**: *`SaleKind`*

*Defined in [types.ts:175](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L175)*

___
<a id="salt"></a>

###  salt

**● salt**: *`string`*

*Defined in [types.ts:187](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L187)*

___
<a id="side"></a>

###  side

**● side**: *[OrderSide](../enums/orderside.md)*

*Defined in [types.ts:174](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L174)*

___
<a id="staticextradata"></a>

###  staticExtradata

**● staticExtradata**: *`string`*

*Defined in [types.ts:181](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L181)*

___
<a id="statictarget"></a>

###  staticTarget

**● staticTarget**: *`string`*

*Defined in [types.ts:180](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L180)*

___
<a id="taker"></a>

###  taker

**● taker**: *`string`*

*Defined in [types.ts:167](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L167)*

___
<a id="takerprotocolfee"></a>

###  takerProtocolFee

**● takerProtocolFee**: *`string`*

*Defined in [types.ts:171](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L171)*

___
<a id="takerrelayerfee"></a>

###  takerRelayerFee

**● takerRelayerFee**: *`string`*

*Defined in [types.ts:169](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L169)*

___
<a id="target"></a>

###  target

**● target**: *`string`*

*Defined in [types.ts:176](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L176)*

___
<a id="token_id"></a>

### `<Optional>` token_id

**● token_id**: * `number` &#124; `string`
*

*Defined in [types.ts:203](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L203)*

___
<a id="v"></a>

### `<Optional>` v

**● v**: * `undefined` &#124; `number`
*

*Defined in [types.ts:196](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L196)*

___

