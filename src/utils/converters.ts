import {
  Fee,
  OpenSeaAccount,
  OpenSeaCollection,
  OpenSeaPaymentToken,
  PricingCurrencies,
  RarityStrategy,
} from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Converts a collection JSON response to an OpenSeaCollection object.
 * @param collection The raw collection JSON from the API
 * @returns OpenSeaCollection object
 */
export const collectionFromJSON = (collection: any): OpenSeaCollection => {
  return {
    name: collection.name,
    collection: collection.collection,
    description: collection.description,
    imageUrl: collection.image_url,
    bannerImageUrl: collection.banner_image_url,
    owner: collection.owner,
    safelistStatus: collection.safelist_status,
    category: collection.category,
    isDisabled: collection.is_disabled,
    isNSFW: collection.is_nsfw,
    traitOffersEnabled: collection.trait_offers_enabled,
    collectionOffersEnabled: collection.collection_offers_enabled,
    openseaUrl: collection.opensea_url,
    projectUrl: collection.project_url,
    wikiUrl: collection.wiki_url,
    discordUrl: collection.discord_url,
    telegramUrl: collection.telegram_url,
    twitterUsername: collection.twitter_username,
    instagramUsername: collection.instagram_username,
    contracts: (collection.contracts ?? []).map((contract: any) => ({
      address: contract.address,
      chain: contract.chain,
    })),
    editors: collection.editors,
    fees: (collection.fees ?? []).map(feeFromJSON),
    rarity: rarityFromJSON(collection.rarity),
    pricingCurrencies: pricingCurrenciesFromJSON(collection.pricing_currencies),
    totalSupply: collection.total_supply,
    uniqueItemCount: collection.unique_item_count,
    createdDate: collection.created_date,
    requiredZone: collection.required_zone,
  };
};

/**
 * Converts a rarity JSON response to a RarityStrategy object.
 * @param rarity The raw rarity JSON from the API
 * @returns RarityStrategy object or null
 */
export const rarityFromJSON = (rarity: any): RarityStrategy | null => {
  if (!rarity) {
    return null;
  }
  const fromJSON: RarityStrategy = {
    strategyId: rarity.strategy_id,
    strategyVersion: rarity.strategy_version,
    calculatedAt: rarity.calculated_at,
    maxRank: rarity.max_rank,
    tokensScored: rarity.tokens_scored,
  };
  return fromJSON;
};

/**
 * Converts a payment token JSON response to an OpenSeaPaymentToken object.
 * @param token The raw payment token JSON from the API
 * @returns OpenSeaPaymentToken object
 */
export const paymentTokenFromJSON = (token: any): OpenSeaPaymentToken => {
  const fromJSON: OpenSeaPaymentToken = {
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    address: token.address,
    chain: token.chain,
    imageUrl: token.image,
    ethPrice: token.eth_price,
    usdPrice: token.usd_price,
  };
  return fromJSON;
};

/**
 * Converts a pricing currencies JSON response to a PricingCurrencies object.
 * @param pricingCurrencies The raw pricing currencies JSON from the API
 * @returns PricingCurrencies object or undefined
 */
export const pricingCurrenciesFromJSON = (
  pricingCurrencies: any,
): PricingCurrencies | undefined => {
  if (!pricingCurrencies) {
    return undefined;
  }
  return {
    listingCurrency: pricingCurrencies.listing_currency
      ? paymentTokenFromJSON(pricingCurrencies.listing_currency)
      : undefined,
    offerCurrency: pricingCurrencies.offer_currency
      ? paymentTokenFromJSON(pricingCurrencies.offer_currency)
      : undefined,
  };
};

/**
 * Converts an account JSON response to an OpenSeaAccount object.
 * @param account The raw account JSON from the API
 * @returns OpenSeaAccount object
 */
export const accountFromJSON = (account: any): OpenSeaAccount => {
  return {
    address: account.address,
    username: account.username,
    profileImageUrl: account.profile_image_url,
    bannerImageUrl: account.banner_image_url,
    website: account.website,
    socialMediaAccounts: (account.social_media_accounts ?? []).map(
      (acct: any) => ({
        platform: acct.platform,
        username: acct.username,
      }),
    ),
    bio: account.bio,
    joinedDate: account.joined_date,
  };
};

/**
 * Converts a fee JSON response to a Fee object.
 * @param fee The raw fee JSON from the API
 * @returns Fee object
 */
export const feeFromJSON = (fee: any): Fee => {
  const fromJSON: Fee = {
    fee: fee.fee,
    recipient: fee.recipient,
    required: fee.required,
  };
  return fromJSON;
};
