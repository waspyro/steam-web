import SteamWeb from "../index";
import InventoryRequests, {InventoryItemsResponse} from "../requests/InventoryRequests";
import {defaultify, uMake} from "../utils";
import {uCommunity} from "../assets/urls";
import {getSuccessfulJsonFromResponse} from "steam-session/dist/utils";
import {obj} from "steam-session/dist/extra/types";
import {needsProp} from "../utils/decorators";
import {AtLeast, InventoryRequestOpts} from "../types";

export default class Inventory {
    requests: InventoryRequests
    constructor(private web: SteamWeb) {
        this.requests = new InventoryRequests(web)
    }

    private static readonly defaultInventoryRequestParams = {
        appid: '753', contextid: '6', count: 2000, language: 'english'
    }

    #get(opts: InventoryRequestOpts): Promise<InventoryItemsResponse>  {
        return this.requests.inventoryItems(opts)
            .then(getSuccessfulJsonFromResponse)
    }

    get(opts: AtLeast<InventoryRequestOpts, 'steamid'>) {
        if(!opts.referer) opts.referer = uMake(uCommunity, ['profiles', opts.steamid, 'inventory']).toString()
        return this.#get(defaultify(Inventory.defaultInventoryRequestParams, opts))
    }

    @needsProp('steamid') @needsProp('profile')
    getSelf(opts: Omit<Partial<InventoryRequestOpts>, 'steamid' | 'referer'> & obj) {
        opts.steamid = this.web.session.steamid
        opts.referer = this.web.props.profileUrl[0]
        return this.#get(defaultify(Inventory.defaultInventoryRequestParams, opts as InventoryRequestOpts))
    }

    async *it() {

    }

    load() {}

    getInventoryContexts() {}



}
