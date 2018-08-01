[opensea-js](../README.md) > [Order](../interfaces/order.md)

# Interface: Order

## Hierarchy

↳  [UnsignedOrder](unsignedorder.md)

 `ECSignature`

**↳ Order**

## Index

### Properties

* [asset](order.md#asset)
* [basePrice](order.md#baseprice)
* [calldata](order.md#calldata)
* [cancelledOrFinalized](order.md#cancelledorfinalized)
* [currentPrice](order.md#currentprice)
* [exchange](order.md#exchange)
* [expirationTime](order.md#expirationtime)
* [extra](order.md#extra)
* [feeMethod](order.md#feemethod)
* [feeRecipient](order.md#feerecipient)
* [hash](order.md#hash)
* [howToCall](order.md#howtocall)
* [listingTime](order.md#listingtime)
* [maker](order.md#maker)
* [makerProtocolFee](order.md#makerprotocolfee)
* [makerRelayerFee](order.md#makerrelayerfee)
* [markedInvalid](order.md#markedinvalid)
* [metadata](order.md#metadata)
* [paymentToken](order.md#paymenttoken)
* [r](order.md#r)
* [replacementPattern](order.md#replacementpattern)
* [s](order.md#s)
* [saleKind](order.md#salekind)
* [salt](order.md#salt)
* [side](order.md#side)
* [staticExtradata](order.md#staticextradata)
* [staticTarget](order.md#statictarget)
* [taker](order.md#taker)
* [takerProtocolFee](order.md#takerprotocolfee)
* [takerRelayerFee](order.md#takerrelayerfee)
* [target](order.md#target)
* [v](order.md#v)

---

## Properties

<a id="asset"></a>

### `<Optional>` asset

**● asset**: * `undefined` &#124; `object`
*

*Defined in [types.ts:96](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L96)*

___
<a id="baseprice"></a>

###  basePrice

**● basePrice**: *`BigNumber`*

*Inherited from Order.basePrice*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:103*

___
<a id="calldata"></a>

###  calldata

**● calldata**: *`string`*

*Inherited from Order.calldata*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:98*

___
<a id="cancelledorfinalized"></a>

### `<Optional>` cancelledOrFinalized

**● cancelledOrFinalized**: * `undefined` &#124; `true` &#124; `false`
*

*Defined in [types.ts:93](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L93)*

___
<a id="currentprice"></a>

### `<Optional>` currentPrice

**● currentPrice**: *`BigNumber`*

*Defined in [types.ts:95](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L95)*

___
<a id="exchange"></a>

###  exchange

**● exchange**: *`string`*

*Inherited from Order.exchange*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:85*

___
<a id="expirationtime"></a>

###  expirationTime

**● expirationTime**: *`BigNumber`*

*Inherited from Order.expirationTime*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:106*

___
<a id="extra"></a>

###  extra

**● extra**: *`BigNumber`*

*Inherited from Order.extra*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:104*

___
<a id="feemethod"></a>

###  feeMethod

**● feeMethod**: *[FeeMethod](../enums/feemethod.md)*

*Inherited from [UnhashedOrder](unhashedorder.md).[feeMethod](unhashedorder.md#feemethod)*

*Overrides Order.feeMethod*

*Defined in [types.ts:76](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L76)*

___
<a id="feerecipient"></a>

###  feeRecipient

**● feeRecipient**: *`string`*

*Inherited from Order.feeRecipient*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:92*

___
<a id="hash"></a>

###  hash

**● hash**: *`string`*

*Inherited from [UnsignedOrder](unsignedorder.md).[hash](unsignedorder.md#hash)*

*Defined in [types.ts:88](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L88)*

___
<a id="howtocall"></a>

###  howToCall

**● howToCall**: *`HowToCall`*

*Inherited from [UnhashedOrder](unhashedorder.md).[howToCall](unhashedorder.md#howtocall)*

*Overrides Order.howToCall*

*Defined in [types.ts:79](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L79)*

___
<a id="listingtime"></a>

###  listingTime

**● listingTime**: *`BigNumber`*

*Inherited from Order.listingTime*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:105*

___
<a id="maker"></a>

###  maker

**● maker**: *`string`*

*Inherited from Order.maker*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:86*

___
<a id="makerprotocolfee"></a>

###  makerProtocolFee

**● makerProtocolFee**: *`BigNumber`*

*Inherited from Order.makerProtocolFee*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:90*

___
<a id="makerrelayerfee"></a>

###  makerRelayerFee

**● makerRelayerFee**: *`BigNumber`*

*Inherited from Order.makerRelayerFee*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:88*

___
<a id="markedinvalid"></a>

### `<Optional>` markedInvalid

**● markedInvalid**: * `undefined` &#124; `true` &#124; `false`
*

*Defined in [types.ts:94](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L94)*

___
<a id="metadata"></a>

###  metadata

**● metadata**: *`object`*

*Inherited from [UnhashedOrder](unhashedorder.md).[metadata](unhashedorder.md#metadata)*

*Defined in [types.ts:81](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L81)*

#### Type declaration

 asset: [WyvernAsset](wyvernasset.md)

 schema: `SchemaName`

___
<a id="paymenttoken"></a>

###  paymentToken

**● paymentToken**: *`string`*

*Inherited from Order.paymentToken*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:102*

___
<a id="r"></a>

###  r

**● r**: *`string`*

*Inherited from ECSignature.r*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:44*

___
<a id="replacementpattern"></a>

###  replacementPattern

**● replacementPattern**: *`string`*

*Inherited from Order.replacementPattern*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:99*

___
<a id="s"></a>

###  s

**● s**: *`string`*

*Inherited from ECSignature.s*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:45*

___
<a id="salekind"></a>

###  saleKind

**● saleKind**: *`SaleKind`*

*Inherited from [UnhashedOrder](unhashedorder.md).[saleKind](unhashedorder.md#salekind)*

*Overrides Order.saleKind*

*Defined in [types.ts:78](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L78)*

___
<a id="salt"></a>

###  salt

**● salt**: *`BigNumber`*

*Inherited from Order.salt*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:107*

___
<a id="side"></a>

###  side

**● side**: *[OrderSide](../enums/orderside.md)*

*Inherited from [UnhashedOrder](unhashedorder.md).[side](unhashedorder.md#side)*

*Overrides Order.side*

*Defined in [types.ts:77](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L77)*

___
<a id="staticextradata"></a>

###  staticExtradata

**● staticExtradata**: *`string`*

*Inherited from Order.staticExtradata*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:101*

___
<a id="statictarget"></a>

###  staticTarget

**● staticTarget**: *`string`*

*Inherited from Order.staticTarget*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:100*

___
<a id="taker"></a>

###  taker

**● taker**: *`string`*

*Inherited from Order.taker*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:87*

___
<a id="takerprotocolfee"></a>

###  takerProtocolFee

**● takerProtocolFee**: *`BigNumber`*

*Inherited from Order.takerProtocolFee*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:91*

___
<a id="takerrelayerfee"></a>

###  takerRelayerFee

**● takerRelayerFee**: *`BigNumber`*

*Inherited from Order.takerRelayerFee*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:89*

___
<a id="target"></a>

###  target

**● target**: *`string`*

*Inherited from Order.target*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:96*

___
<a id="v"></a>

###  v

**● v**: *`number`*

*Inherited from ECSignature.v*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:43*

___

