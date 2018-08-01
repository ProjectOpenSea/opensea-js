[opensea-js](../README.md) > [UnhashedOrder](../interfaces/unhashedorder.md)

# Interface: UnhashedOrder

## Hierarchy

 `Order`

**↳ UnhashedOrder**

↳  [UnsignedOrder](unsignedorder.md)

## Index

### Properties

* [basePrice](unhashedorder.md#baseprice)
* [calldata](unhashedorder.md#calldata)
* [exchange](unhashedorder.md#exchange)
* [expirationTime](unhashedorder.md#expirationtime)
* [extra](unhashedorder.md#extra)
* [feeMethod](unhashedorder.md#feemethod)
* [feeRecipient](unhashedorder.md#feerecipient)
* [howToCall](unhashedorder.md#howtocall)
* [listingTime](unhashedorder.md#listingtime)
* [maker](unhashedorder.md#maker)
* [makerProtocolFee](unhashedorder.md#makerprotocolfee)
* [makerRelayerFee](unhashedorder.md#makerrelayerfee)
* [metadata](unhashedorder.md#metadata)
* [paymentToken](unhashedorder.md#paymenttoken)
* [replacementPattern](unhashedorder.md#replacementpattern)
* [saleKind](unhashedorder.md#salekind)
* [salt](unhashedorder.md#salt)
* [side](unhashedorder.md#side)
* [staticExtradata](unhashedorder.md#staticextradata)
* [staticTarget](unhashedorder.md#statictarget)
* [taker](unhashedorder.md#taker)
* [takerProtocolFee](unhashedorder.md#takerprotocolfee)
* [takerRelayerFee](unhashedorder.md#takerrelayerfee)
* [target](unhashedorder.md#target)

---

## Properties

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

*Overrides Order.feeMethod*

*Defined in [types.ts:76](https://github.com/ProjectOpenSea/opensea-js/blob/57ea692/src/types.ts#L76)*

___
<a id="feerecipient"></a>

###  feeRecipient

**● feeRecipient**: *`string`*

*Inherited from Order.feeRecipient*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:92*

___
<a id="howtocall"></a>

###  howToCall

**● howToCall**: *`HowToCall`*

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
<a id="metadata"></a>

###  metadata

**● metadata**: *`object`*

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
<a id="replacementpattern"></a>

###  replacementPattern

**● replacementPattern**: *`string`*

*Inherited from Order.replacementPattern*

*Defined in /Users/alex/Sites/Projects/Ozone/OpenSea/opensea-js/node_modules/wyvern-js/lib/types.d.ts:99*

___
<a id="salekind"></a>

###  saleKind

**● saleKind**: *`SaleKind`*

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

