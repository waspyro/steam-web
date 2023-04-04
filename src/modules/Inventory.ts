import SteamWeb from "../index";
import InventoryRequests, {
    asset, AssetsDescriptionsCollection,
    descriptionCommon,
    InventoryContexts,
    InventoryItemsResponse, OpenBoosterPackResponse
} from "../requests/InventoryRequests";
import {defaultify} from "../utils";
import {getSuccessfulJsonFromResponse, getSuccessfulResponseJson} from "steam-session/dist/utils";
import {AtLeast, InventoryRequestOpts, OneOfInventory, WholeInventoryOpts} from "../types";
import {getSuccessfullText} from "../utils/responseProcessors";
import parseInventoryContexts from "../parsers/parseInventoryContexts";
import {needsProp} from "../utils/decorators";

export default class Inventory {
    requests: InventoryRequests
    constructor(private web: SteamWeb) {
        this.requests = new InventoryRequests(web)
    }

    private static readonly defaultInventoryRequestParams = {
        appid: '753', contextid: '6', count: 2000, language: 'english'
    }

    private static defaultify(opts) {
        if(!opts.referer) opts.referer = ['profiles', opts.steamid]
        return defaultify(Inventory.defaultInventoryRequestParams, opts)
    }

    #get(opts: InventoryRequestOpts): Promise<InventoryItemsResponse>  {
        return this.requests.inventoryItems(opts)(getSuccessfulJsonFromResponse)
    }

    async *it(opts: AtLeast<InventoryRequestOpts, 'steamid'>, limit = Infinity) {
        opts = Inventory.defaultify(opts)
        while (limit > 0) {
            if((limit -= opts.count) < 0) opts.count += limit //{count: 2000} && limit 4100 = [2000, 2000, 100]
            const results = await this.#get(opts as InventoryRequestOpts)
            if (!results.descriptions) results.descriptions = []
            if (!results.assets) results.assets = []
            for (const d of results.descriptions) d.contextid = opts.contextid
            yield {assets: results.assets, descriptions: results.descriptions}
            if (!results.more_items) break
            opts.startAssetid = results.last_assetid
        }
    }

    slice(opts: AtLeast<InventoryRequestOpts, 'steamid'>) {
        return this.#get(Inventory.defaultify(opts))
    }

    async load(opts: AtLeast<InventoryRequestOpts, 'steamid'>, limit: number = Infinity):
        Promise<AssetsDescriptionsCollection> {
        const descriptions: descriptionCommon[] = []
        const assets: asset[] = []
        for await (const resp of this.it(opts, limit)) {
            descriptions.push(...resp.descriptions)
            assets.push(...resp.assets)
        }
        return {descriptions, assets}
    }

    async loadWhole(opts: WholeInventoryOpts) {
        const contexts = await this.getContexts(opts)
        for(const appid in contexts) {
            for(const contextid in contexts[appid].rgContexts) {
                contexts[appid].rgContexts[contextid].items = await this.load({
                    appid, contextid, steamid: opts.steamid, referer: opts.referer,
                    count: opts.count, language: opts.language
                })
            }
        }
        return contexts as InventoryContexts<{items: AssetsDescriptionsCollection}>
    }

    //todo: should be type {steamid: string} | {referer: ProfileUrlParts} don't know how to satisfy ts with this
    getContexts(opts: OneOfInventory): Promise<InventoryContexts> {
        if(!opts.referer) opts.referer = ['profiles', opts.steamid]
        return this.requests.inventoryPage(opts.referer)(getSuccessfullText).then(text => {
            const ctxs = parseInventoryContexts(text)
            if(ctxs === null) throw new Error('Unable to parse inventory contexts from page')
            return ctxs
        })
    }

    //steam returns 500 status code if details is bad, so we cannot be sure if we should
    //retry request because steam is down or just throw error because it is bad pack :(
    @needsProp('steamid') @needsProp('profile')
    openBoosterPack(boosterAppId: string, assetid: string): Promise<OpenBoosterPackResponse['rgItems']> {
        const sessionid = this.web.session.sessionid
        const profile = this.web.props.profileUrl
        return this.requests.unpackBooster(sessionid, profile, boosterAppId, assetid)
        (getSuccessfulResponseJson).then((r: OpenBoosterPackResponse) => {
            if(!r.rgItems) throw new Error('Unable to open pack. Response: \n' + JSON.stringify(r))
            return r.rgItems
        })
    }

}
