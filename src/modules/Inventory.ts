import SteamWeb from "../index";
import InventoryRequests, {InventoryContexts, InventoryItemsResponse} from "../requests/InventoryRequests";
import {defaultify, uMake} from "../utils";
import {uCommunity} from "../assets/urls";
import {getSuccessfulJsonFromResponse} from "steam-session/dist/utils";
import {AtLeast, InventoryRequestOpts, ProfileUrlParts} from "../types";
import {getSuccessfullText} from "../utils/responseProcessors";
import parseInventoryContexts from "../parsers/parseInventoryContexts";

export default class Inventory {
    requests: InventoryRequests
    constructor(private web: SteamWeb) {
        this.requests = new InventoryRequests(web)
    }

    private static readonly defaultInventoryRequestParams = {
        appid: '753', contextid: '6', count: 2000, language: 'english'
    }

    #get(opts: InventoryRequestOpts): Promise<InventoryItemsResponse>  {
        return this.requests.inventoryItems(opts)(getSuccessfulJsonFromResponse)
    }

    get(opts: AtLeast<InventoryRequestOpts, 'steamid'>) {
        if(!opts.referer) opts.referer = uMake(uCommunity, ['profiles', opts.steamid, 'inventory']).toString()
        return this.#get(defaultify(Inventory.defaultInventoryRequestParams, opts))
    }

    async *it(requestOpts: AtLeast<InventoryRequestOpts, 'steamid'>, limit = Infinity) {
        requestOpts = defaultify(Inventory.defaultInventoryRequestParams, requestOpts)
        while (limit > 0) {
            if((limit -= requestOpts.count) < 0) requestOpts.count += limit //{count: 2000} && limit 4100 = [2000, 2000, 100]
            const results = await this.#get(requestOpts as InventoryRequestOpts)
            if (!results.descriptions) results.descriptions = []
            if (!results.assets) results.assets = []
            for (const d of results.descriptions) d.contextid = requestOpts.contextid
            yield {assets: results.assets, descriptions: results.descriptions}
            if (!results.more_items) break
            requestOpts.startAssetid = results.last_assetid
        }
    }

    load() {}

    getInventoryContexts(profileUrl: ProfileUrlParts): Promise<InventoryContexts> {
        return this.requests.inventoryPage(profileUrl)(getSuccessfullText).then(text => {
            const ctxs = parseInventoryContexts(text)
            if(ctxs === null) throw new Error('Unable to parse inventory contexts from page')
            return ctxs
        })
    }

}
