import SteamWebModule from "./SteamWebModule";
import {Numberable} from "../types";
import {appDetails, bundlePage, packageDetails, storeSearch} from "../requests/storeRequests";
import {
    asJson,
    asJsonWith,
    asSuccessJson,
    asSuccessJsonWith,
    ExpectAndRun,
    statusOk
} from "../utils/responseProcessors";
import {
    AppDetails,
    AppDetailsFilters,
    AppDetailsPriceOverviewResponse,
    PackageDetails, StoreSearchParams, StoreSearchResponse
} from "../types/storeTypes";
import {MalformedResponse} from "steam-session/dist/Errors";
import {BadJSONStatus, UnexpectedHTTPResponseStatus} from "../utils/errors";
import {ECounty} from "../assets/ECurrency";
import parseStoreBundlePage, {BundleDetailsParsed} from "../parsers/parseStoreBundlePage";
import SteamWeb from "../index";
import {uStore} from "../assets/urls";
import parseStoreSearchResponse, {ParsedStoreSearchResponse} from "../parsers/parseStoreSearchResponse";

export default class Store extends SteamWebModule {

    constructor(steamWeb: SteamWeb) {
        super(steamWeb)
        this.#setDefaultStoreCookies()
    }

    private static SuccessfulJsonWithOneID = (id: Numberable) =>
        ExpectAndRun(statusOk, asJson, (res: any) =>
    {
        id = String(id)
        if(!res[id]) throw new MalformedResponse(res, id)
        if(!res[id].success) throw new BadJSONStatus(res, [id.toString(), 'success'], [true], res[id]["success"])
        return res[id].data
    })

    getAppDetails(
        appid: Numberable, countryCode?: ECounty, filters?: AppDetailsFilters[]
    ): Promise<AppDetails> {
        return this.request(false, appDetails, [appid], countryCode, filters)
        (Store.SuccessfulJsonWithOneID(appid))
    }

    getAppsPriceOverview(
        appids: Numberable[], countryCode?: ECounty
    ): Promise<AppDetailsPriceOverviewResponse> {
        return this.request(false, appDetails, appids, countryCode, ['price_overview'])
        (ExpectAndRun(statusOk, asJson))
    }

    packageDetails(packageid: Numberable, countyCode?: ECounty): Promise<PackageDetails> {
        return this.request(false, packageDetails, packageid, countyCode)
        (Store.SuccessfulJsonWithOneID(packageid))
    }

    bundleDetails(bundleid: Numberable): Promise<BundleDetailsParsed> {
        return this.request(false, bundlePage, bundleid)
        (res => res.text().then(html => {
            if(res.status === 200) return parseStoreBundlePage(html, bundleid)
            if(res.status === 302 && res.headers.get('location') === 'https://store.steampowered.com/')
                throw new Error('Bundle '+bundleid+' not exists or not accessible')
            throw new UnexpectedHTTPResponseStatus(res, [200])
        }))
    }

    search(params: StoreSearchParams): Promise<StoreSearchResponse & {results: ParsedStoreSearchResponse}> {
        return this.request(false, storeSearch, params)
        (ExpectAndRun(statusOk, asSuccessJson, (json: any) => { //StoreSearchResponse
            json.results = parseStoreSearchResponse(json.results_html);
            return json
        }))
    }

    //todo .createCart, or external manager?
    addItemToCart() {}
    rmItemFromCart() {}
    checkoutWithWallet() {}

    #setDefaultStoreCookies() { //todo temporary cookies? use decorators?
        const store = this.web.session.cookies
        const url = new URL(uStore)
        const cookies = store.get(url)
        if(!cookies.find(c => c.name === 'birthtime')) store.add({
            domain: url.hostname,
            path: '/',
            name: 'birthtime',
            value: '880927201'
        })
        if(!cookies.find(c => c.name === 'lastagecheckage')) store.add({
            domain: url.hostname,
            path: '/',
            name: 'lastagecheckage',
            value: '1-0-1998'
        })
    }

}