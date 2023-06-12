import SteamWeb from "../SteamWeb";
import {
	inventoryItems,
	inventoryPage, unpackBooster
} from "../requests/inventoryRequests";
import {defaultify} from "../utils";
import {getSuccessfullText} from "../utils/responseProcessors";
import parseInventoryContexts from "../parsers/parseInventoryContexts";
import {needsProp} from "../utils/decorators";
import {getSuccessfulJsonFromResponse, getSuccessfulResponseJson} from "steam-session/dist/common/utils";
import {
	Asset,
	AssetsDescriptionsCollection,
	DescriptionsCommon,
	InventoryContexts,
	InventoryItemsResponse, InventoryRequestOpts, OpenBoosterPackResponse, WholeInventoryOpts
} from "../types/inventoryTypes";
import {ProfileUrlParts} from "../types/profileTypes";
import {obj} from "steam-session/dist/common/types";

export default class Inventory {
	private readonly request: SteamWeb['processRequest']
	constructor(private web: SteamWeb) {
		this.request = web.processRequest
	}

	static defaultInventoryRequestParams = {contextid: '6', count: 2000, language: 'english'}

	#get(opts: InventoryRequestOpts): Promise<InventoryItemsResponse>  {
		return this.request(true, inventoryItems, opts)(getSuccessfulJsonFromResponse)
	}

	private setDefaultSteamIDAndRefererOpts = <T extends obj>(opts: T) => {
		const o: any = opts
		if(!o.steamid)
			if(!(o.steamid = this.web.session.steamid))
				throw new Error('Missing steamid option and session.steamid not yet initialized to use it as default')
		if(!o.referer)
			o.referer = this.web.props.profileUrl || ['profiles', opts.steamid]
		return opts as T & {steamid: string, referer: ProfileUrlParts}
	}

	private defaultify = (opts: InventoryRequestOpts) => {
		this.setDefaultSteamIDAndRefererOpts(opts)
		return defaultify(Inventory.defaultInventoryRequestParams, opts)
	}

	async *it(opts: InventoryRequestOpts, limit = Infinity) {
		this.defaultify(opts)
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

	slice(opts: InventoryRequestOpts) {
		return this.#get(this.defaultify(opts))
	}

	async load(
		opts: InventoryRequestOpts,
		limit: number = Infinity
	): Promise<AssetsDescriptionsCollection> {
		this.defaultify(opts)
		const descriptions: DescriptionsCommon[] = []
		const assets: Asset[] = []
		for await (const resp of this.it(opts, limit)) {
			descriptions.push(...resp.descriptions)
			assets.push(...resp.assets)
		}
		return {descriptions, assets}
	}

	async loadWhole(opts: WholeInventoryOpts = {}) {
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

	getContexts(opts: {steamid?: string, referer?: ProfileUrlParts} = {}): Promise<InventoryContexts> {
		this.setDefaultSteamIDAndRefererOpts(opts)
		return this.request(false, inventoryPage, opts.referer)
		(getSuccessfullText).then(text => {
			const ctxs = parseInventoryContexts(text)
			if(ctxs === null) throw new Error('Unable to parse inventory contexts from page')
			return ctxs
		})
	}

	// steam returns 500 status code if details is bad, so we cannot be sure if we should
	// retry request because steam is down or just throw error because it is bad pack :(
	@needsProp('steamid') @needsProp('profile')
	openBoosterPack(boosterAppId: string, assetid: string): Promise<OpenBoosterPackResponse['rgItems']> {
		const sessionid = this.web.session.sessionid
		const profile = this.web.props.profileUrl
		return this.request(true, unpackBooster, sessionid, profile, boosterAppId, assetid)
		(getSuccessfulResponseJson).then((r: OpenBoosterPackResponse) => {
			if(!r.rgItems) throw new Error('Unable to open pack. Response: \n' + JSON.stringify(r))
			return r.rgItems
		})
	}

}
