import {
	uCommunity,
	uMarket, uMarketEligibilityCheck,
	uMarketListings, uMarketMultiBuy,
	uMarketMultisell,
	uMarketOrderHistogram,
	uMarketPriceHistory,
	uMarketPriceOverview,
	uMarketRemoveListing,
	uMarketSearch,
	uMarketSellItem,
	uMarketSellListings
} from "../assets/urls";
import {_, EMPA, uMake} from "../utils";
import {Numberable, RequestConstructorReturns} from "../types";
import {Item, ItemWithNameid, MarketAsset, MarketSearchRequestParams, StartCountAble} from "../types/marketTypes";
import {ECurrency, ECurrencyValues} from "../assets/ECurrency";
import {ProfileUrlParts} from "../types/profileTypes";

export const listingPage = (item: Item) => [
	uMake(uMarketListings, [item.appid, item.market_hash_name])
] as RequestConstructorReturns

export const marketHomePage = () => [
	new URL(uMarket)
] as RequestConstructorReturns

export const eligibilityCheck = () => [
	new URL(uMarketEligibilityCheck), {
	followRedirects: 0
}] as RequestConstructorReturns

export const priceHistory = (
	item: Item, referer: ProfileUrlParts //todo: different locations?
) => [
	uMake(uMarketPriceHistory, EMPA, item), {
		headers: {
			'X-Prototype-Version': '1.7',
			'X-Requested-With': 'XMLHttpRequest',
			'Pragma': 'no-cache',
			'Cache-Control': 'no-cache',
			'Sec-Fetch-Mode': 'cors',
			'Referer': uMake(uCommunity, [referer[0], referer[1], 'inventory']).toString()
		}
	}] as RequestConstructorReturns

//todo currency country language types
export const itemOrdersHistogram = (
	{nameid, appid, market_hash_name}: ItemWithNameid,
	currency: ECurrencyValues | number = ECurrency['USD'],
	country = 'US', language = 'english'
) => [
	uMake(uMarketOrderHistogram, EMPA, { country, language, currency, item_nameid: nameid, two_factor: 0 }), {
		headers: {
			// 'if-modified-since': new Date().toUTCString(),
			'X-Requested-With': 'XMLHttpRequest',
			'Accept-Language': 'en-GB,en;q=0.9',
			'Pragma': 'no-cache',
			'Cache-Control': 'no-cache',
			'Sec-Fetch-Mode': 'cors',
			'Referer': uMake(uMarket, ['listings', appid, encodeURIComponent(market_hash_name)]).toString()
		}
	}] as RequestConstructorReturns

export const sellItem = (
	profile: ProfileUrlParts,
	sessionid: string,
	{appid, contextid, assetid, amount = '1'}: MarketAsset,
	priceCents: Numberable
) => [
	new URL(uMarketSellItem), {
		method: 'POST',
		body: new URLSearchParams({
			appid: appid, contextid, assetid,
			amount, price: priceCents, sessionid
		} as any),
		headers: {
			Referer: uMake(uCommunity, [profile[0], profile[1], 'inventory']).toString()
		}}
] as RequestConstructorReturns

export const mySellListings = (params: StartCountAble) => [
	uMake(uMarketSellListings, EMPA, params)
] as RequestConstructorReturns

export const multisellPage = (appid: Numberable, contextid: Numberable, items: readonly string[]) => [
	uMake(uMarketMultisell, EMPA, {appid, contextid}, items.map(el => ({items: el, qty: 1})), 'brackets')
] as RequestConstructorReturns

export const multibuyPage = (appid: Numberable, contextid: Numberable, items: readonly string[]) => [
	uMake(uMarketMultiBuy, EMPA, {appid, contextid}, items.map(el => ({items: el, qty: 1})), 'brackets')
] as RequestConstructorReturns

export const removeMarketListing = (sessionid, id) => [
	uMake(uMarketRemoveListing, [id]), {
		method: 'POST',
		body: new URLSearchParams({ sessionid }),
		headers: {
			Referer: uMarket,
			Origin: uCommunity
		}}
] as RequestConstructorReturns

// market_hash_name = encodeURIComponent(market_hash_name)
export const itemPriceOverview = (
	{appid, market_hash_name}, currency: number, country: string, referer: ProfileUrlParts
) => [
	uMake(uMarketPriceOverview + '/', _, {country, currency, appid, market_hash_name}), {
		headers: {
			'X-Prototype-Version': '1.7',
			'X-Requested-With': 'XMLHttpRequest',
			Referer: uMake(uCommunity, [referer[0], referer[1]]).toString()
		}
	}] as RequestConstructorReturns

export const marketSearch = ({
	                             start = 0, count = 100, sortDir = 'desc',
	                             sortBy = 'quantity', appid = 753, filters = [],
                             }: MarketSearchRequestParams) => {
	const qs = {
		query: '', search_descriptions: 0, norender: 1,
		start, count, appid, sort_dir: sortDir, sort_column: sortBy
	}

	for(const [key, value] of filters)
		qs[`category_${appid}_${key}[]`] = value

	return [
		uMake(uMarketSearch, EMPA, qs)
	] as RequestConstructorReturns
}
