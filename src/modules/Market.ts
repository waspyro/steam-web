import SteamWebModule from "./SteamWebModule";
import {
    itemOrdersHistogram,
    itemPriceOverview,
    listingPage, marketSearch,
    multisellPage,
    priceHistory,
} from "../requests/marketRequests";
import {
    asSuccessJson,
    asSuccessJsonWith,
    ExpectAndRun,
    getSuccessfullText,
    statusOk
} from "../utils/responseProcessors";
import parseNameidFromLisngPage from "../parsers/parseNameidFromListingPage";
import parseNameidFromMultisellPage from "../parsers/parseNameidFromMultisellPage";
import {ErrorWithContext} from "../utils/errors";
import {ProfileUrlParts} from "../types";
import xPriceGuessed from "../utils/xPriceGuessed";
import {
    MarketItemPriceOverviewResponse,
    MarketItemPriceOverviewParsed,
    MarketItemPriceHistoryResponse,
    Item,
    ItemWithNameid,
    MarketItemOrderHistogramResponse,
    MarketPriceHistoryResponseNormalized, MarketSearchRequestParams, MarketSearchResponseResults
} from "../types/marketTypes";
import {ECurrency, ECurrencyValues} from "../assets/ECurrency";
import {minifyItemOrdersResponse} from "../parsers/parseMarketOrders";

export default class Market extends SteamWebModule {

    getItemNameID(item: Item) {
        return this.request(false, listingPage, item)
        (getSuccessfullText).then(parseNameidFromLisngPage)
    }

    getItemsNameIDs<T extends ReadonlyArray<string>>(
        appid: string, contextid: string, hashnames: T
    ): Promise<{ [K in T[number]]: string }>  {
        return this.request(true, multisellPage, appid, contextid, hashnames)
        (getSuccessfullText).then(html => {
            const [nameids, parsedHashNames] = parseNameidFromMultisellPage(html)
            if(parsedHashNames.length !== hashnames.length) throw new Error('got unexpected results')

            const results = {}
            for(let i = 0; i < parsedHashNames.length; i++)
                results[nameids[i]] = nameids[i]

            const namesMissing = []
            for(const name of hashnames)
                if(!results[name]) namesMissing.push(name)
            if(namesMissing.length) throw new ErrorWithContext('Unable to find some nameids', {
                namesRequired: hashnames, namesMissing, results
            })

            return results as { [K in T[number]]: string }
        })
    }

    //todo: get defaults from props
    getItemPriceOverview(
        item: Item, currency: ECurrencyValues | number = ECurrency['USD'],
        country = 'US', referer: ProfileUrlParts = this.web.props.profileUrl
    ) {
        return this.request(false, itemPriceOverview, item, currency, country, referer)
        (ExpectAndRun(statusOk, asSuccessJson, (res: MarketItemPriceOverviewResponse) => {
            const [lowestPrice, responseCurrency] = xPriceGuessed(res.lowest_price)
            const [medianPrice] = xPriceGuessed(res.median_price)
            const volume = res.volume ? Number(res.volume.replaceAll(',', '')) : null
            return {
                price: {lowest: lowestPrice, median: medianPrice},
                currency: responseCurrency, volume
            } as MarketItemPriceOverviewParsed
        }))
    }

    getItemPriceHistoryRaw(
        item: Item, referer: ProfileUrlParts = this.web.props.profileUrl
    ): Promise<MarketItemPriceHistoryResponse> {
        return this.request(false, priceHistory, item, referer)
        (ExpectAndRun(statusOk, asSuccessJson))
    }

    getItemPriceHistory = (...args: Parameters<Market['getItemPriceHistoryRaw']>) => {
        return this.getItemPriceHistoryRaw(...args).then(r => {
            for(const el of r.prices as any) {
                el[0] = new Date(el[0])
                el[2] = Number(el[2])
            }
            return r as unknown as MarketPriceHistoryResponseNormalized
        })
    }

    //TODO: If-Modified-Since header
    getItemOrdersDetailsRaw(
        item: ItemWithNameid,
        currency: ECurrencyValues | number = ECurrency['USD'],
        country = 'US', language = 'english'
    ) {
        return this.request(false, itemOrdersHistogram, item, currency, country, language)
        (ExpectAndRun(statusOk, asSuccessJson)) as Promise<MarketItemOrderHistogramResponse>
    }

    getItemOrdersDetails(...args: Parameters<Market['getItemOrdersDetailsRaw']>) {
        return this.getItemOrdersDetailsRaw(...args).then(minifyItemOrdersResponse)
    }

    search(params: MarketSearchRequestParams): Promise<MarketSearchResponseResults> {
        return this.request(false, marketSearch, params)
        (ExpectAndRun(statusOk, asSuccessJsonWith(['results'])))
    }

}
