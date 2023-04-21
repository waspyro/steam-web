import {load} from "cheerio";

export default (html: string): ParsedStoreSearchResponse => {
    const foundApps = []
    const $ = load(html)
    const apps = $('a')
    apps.each((i, app: any) => {
        app = $(app)
        const urlParts = app.attr('href').split('/?snr')[0].split('/').splice(2)
        const type = urlParts[1]
        const id = urlParts[2]
        const url = urlParts.join('/')
        const name = app.find('.title').text()
        const price = app.find('.search_price_discount_combined').attr('data-price-final') / 100
        const released = app.find('.search_released').text()
        foundApps.push({url, type, id, name, price, released})
    })
    return foundApps
}

export type ParsedStoreSearchResponse = {
    url: string,
    type: 'app' | 'sub' | 'bundle' | string,
    id: string,
    name: string,
    price: number,
    released: string
}[]