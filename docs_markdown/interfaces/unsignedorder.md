[opensea-js](../README.md) > [UnsignedOrder](../interfaces/unsignedorder.md)

# Interface: UnsignedOrder

## Hierarchy

↳  [UnhashedOrder](unhashedorder.md)

**↳ UnsignedOrder**

↳  [Order](order.md)

## Index

### Properties

* [basePrice](unsignedorder.md#baseprice)
* [calldata](unsignedorder.md#calldata)
* [exchange](unsignedorder.md#exchange)
* [expirationTime](unsignedorder.md#expirationtime)
* [extra](unsignedorder.md#extra)
* [feeMethod](unsignedorder.md#feemethod)
* [feeRecipient](unsignedorder.md#feerecipient)
* [hash](unsignedorder.md#hash)
* [howToCall](unsignedorder.md#howtocall)
* [listingTime](unsignedorder.md#listingtime)
* [maker](unsignedorder.md#maker)
* [makerProtocolFee](unsignedorder.md#makerprotocolfee)
* [makerRelayerFee](unsignedorder.md#makerrelayerfee)
* [metadata](unsignedorder.md#metadata)
* [paymentToken](unsignedorder.md#paymenttoken)
* [replacementPattern](unsignedorder.md#replacementpattern)
* [saleKind](unsignedorder.md#salekind)
* [salt](unsignedorder.md#salt)
* [side](unsignedorder.md#side)
* [staticExtradata](unsignedorder.md#staticextradata)
* [staticTarget](unsignedorder.md#statictarget)
* [taker](unsignedorder.md#taker)
* [takerProtocolFee](unsignedorder.md#takerprotocolfee)
* [takerRelayerFee](unsignedorder.md#takerrelayerfee)
* [target](unsignedorder.md#target)

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

*Inherited from [UnhashedOrder](unhashedorder.md).[feeMethod](unhashedorder.md#feemethod)*

*Overrides Order.feeMethod*

*Defined in [types.ts:138](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L138)*

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

*Defined in [types.ts:150](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L150)*

___
<a id="howtocall"></a>

###  howToCall

**● howToCall**: *`HowToCall`*

*Inherited from [UnhashedOrder](unhashedorder.md).[howToCall](unhashedorder.md#howtocall)*

*Overrides Order.howToCall*

*Defined in [types.ts:141](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L141)*

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

*Inherited from [UnhashedOrder](unhashedorder.md).[metadata](unhashedorder.md#metadata)*

*Defined in [types.ts:143](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L143)*

#### Type declaration

 asset: [WyvernAsset](wyvernasset.md)

 schema: [WyvernSchemaName](../enums/wyvernschemaname.md)

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

*Inherited from [UnhashedOrder](unhashedorder.md).[saleKind](unhashedorder.md#salekind)*

*Overrides Order.saleKind*

*Defined in [types.ts:140](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L140)*

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

*Defined in [types.ts:139](https://github.com/ProjectOpenSea/opensea-js/blob/572e318/src/types.ts#L139)*

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

