import {
    uCommunity,
    uMarket,
    uMarketListings, uMarketMultisell,
    uMarketOrderHistogram,
    uMarketPriceHistory, uMarketPriceOverview, uMarketRemoveListing, uMarketSearch,
    uMarketSellItem, uMarketSellListings
} from "../assets/urls";
import {EMPA, uMake} from "../utils";
import {ProfileUrlParts} from "../types";
import {asset} from "./InventoryRequests";

export const listingPage = (item: Item) => [
    uMake(uMarketListings, [item.appid, item.market_hash_name])
] as const

export const marketHomePage = () => [
    new URL(uMarket)
]

// market_hash_name = encodeURIComponent(market_hash_name)
export const priceHistory = (
    appid: string | number, market_hash_name: string, referer: ProfileUrlParts //todo: different locations?
) => [
    uMake(uMarketPriceHistory, EMPA, { appid, market_hash_name }), {
    headers: {
        'X-Prototype-Version': '1.7',
        'X-Requested-With': 'XMLHttpRequest',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Mode': 'cors',
        'Referer': uMake(uCommunity, [referer[0], referer[1], 'inventory']).toString()
    }
}]

//todo currency country language types
export const itemOrdersHistogram = (
    {nameid, appid, market_hash_name}, currency: number = 1, country = 'US', language = 'english'
) => [
    uMake(uMarketOrderHistogram, EMPA, { country, language, currency, item_nameid: nameid, two_factor: 0 }), {
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Mode': 'cors',
        'Referer': uMake(uMarket, ['listings', appid, encodeURIComponent(market_hash_name)]).toString()
    }
}]

export const sellItem = (
    profile, sessionid: string, {appid, contextid, assetid, amount = '1'}: asset, priceCents: number
) => [
    new URL(uMarketSellItem), {
        method: 'POST',
        body: new URLSearchParams({
            appid: String(appid), contextid, assetid,
            amount, price: String(priceCents), sessionid
        }),
        headers: {
            Referer: uMake(uCommunity, [profile[0], profile[1], 'inventory']).toString()
        }
    }]

export const mySellListings = (start, count) => [
    uMake(uMarketSellListings, EMPA, {start, count})
]

export const multisellPage = (appid: string | number, contextid: string | number, items: readonly string[]) => {
    return [
        uMake(uMarketMultisell, EMPA, {appid, contextid}, items.map(el => ({items: el, qty: 1})), 'brackets')
    ] as const
}

export const removeMarketListing = (sessionid, id) => [
    uMake(uMarketRemoveListing, [id]), {
    method: 'POST',
    body: new URLSearchParams({ sessionid }),
    headers: {
        Referer: uMarket,
        Origin: uCommunity
    }}
]

// market_hash_name = encodeURIComponent(market_hash_name)
export const itemPriceOverview = ({appid, market_hash_name}, currency, country, referer) => [
    uMake(uMarketPriceOverview + '/', EMPA, {country, currency, appid, market_hash_name}), {
    headers: {
        'X-Prototype-Version': '1.7',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: uMake(uCommunity, referer[0], referer[1]).toString()
    }
}]

export const search = ({
  start = 0, count = 100, sortDir = 'desc',
  sortBy = 'quantity', appid = 753, filters = [],
} = {}) => {
    const qs = {
        query: '', search_descriptions: 0, norender: 1,
        start, count, appid, sort_dir: sortDir, sort_column: sortBy
    }
    for(const [key, value] of filters)
        qs[`category_${appid}_${key}[]`] = value
    return [uMake(uMarketSearch, EMPA, qs)]
}

export type Item = {
    appid: string,
    market_hash_name: string
}