import SteamWebModule from "./SteamWebModule";
import {Item, itemPriceOverview, listingPage, multisellPage} from "../requests/Market";
import {getSuccessfullText} from "../utils/responseProcessors";
import parseNameidFromLisngPage from "../parsers/parseNameidFromListingPage";
import parseNameidFromMultisellPage from "../parsers/parseNameidFromMultisellPage";
import {ErrorWithContext} from "../utils/errors";
import {ProfileUrlParts} from "../types";
import {getSuccessfulJsonFromResponse} from "steam-session/dist/utils";
import xPriceGuessed from "../utils/xPriceGuessed";
import {MarketItemPriceOverviewResponse, MarketItemPriceOverviewParsed} from "../types/market";
import {ECurrency, ECurrencyValues} from "../types/enums";

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
        (getSuccessfulJsonFromResponse).then((res: MarketItemPriceOverviewResponse) => {
            const [lowestPrice, responseCurrency] = xPriceGuessed(res.lowest_price)
            const [medianPrice] = xPriceGuessed(res.median_price)
            const volume = res.volume ? Number(res.volume.replaceAll(',', '')) : null
            return {
                price: {lowest: lowestPrice, median: medianPrice},
                currency: responseCurrency, volume
            } as MarketItemPriceOverviewParsed
        })
    }

}
