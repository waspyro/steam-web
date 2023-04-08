import {load} from 'cheerio'
import xPriceGuessed from "../utils/xPriceGuessed";
import {
    MySellListingsResponse,
    MySellListingsResponseParsed
} from "../types/marketTypes";

export default (
    html: string, assets: MySellListingsResponse['assets']
): MySellListingsResponseParsed["listings"] => {
    const $ = load(html)
    const listings = []
    const year = new Date().getFullYear()

    $('.market_listing_row').each((i, el) => {
        const $ = load(el)
        let prices = $('.market_listing_price').text().split('\n').map(el => el.trim()).filter(el => el)
        const date = new Date(year + ' ' + $('.market_listing_listed_date').text().trim())
        const [,id, appid, contextid, assetid] = load(el)('.item_market_action_button')
            [0].attribs.href.match(/\((.*)\)/)[1].replaceAll("'", '') .split(',').map(el => el.trim())
        const [price, currency] = xPriceGuessed(prices[0])
        listings.push({asset: assets[appid][contextid][assetid], price, currency, date, id })
    })

    return listings
}