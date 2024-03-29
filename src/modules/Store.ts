import SteamWebModule from "./SteamWebModule";
import {AtLeast, Numberable} from "../types";
import {
	appDetails,
	bundlePage,
	deleteRecommendation,
	packageDetails,
	recommendGame,
	storeSearch
} from "../requests/storeRequests";
import {
	asJson,
	asSuccessJson,
	ExpectAndRun, getSuccessfullText,
	statusOk
} from "../utils/responseProcessors";
import {
	AppDetails,
	AppDetailsFilters,
	AppDetailsPriceOverviewResponse, DynamicStoreTypes,
	PackageDetails, StoreGameReviewForm, StoreSearchParams, StoreSearchResponse
} from "../types/storeTypes";
import {BadJSONStatus, UnexpectedHTTPResponseStatus} from "../utils/errors";
import {ECountry} from "../assets/ECurrency";
import parseStoreBundlePage, {BundleDetailsParsed} from "../parsers/parseStoreBundlePage";
import SteamWeb from "../SteamWeb";
import {uStore} from "../assets/urls";
import parseStoreSearchResponse, {ParsedStoreSearchResponse} from "../parsers/parseStoreSearchResponse";
import {MalformedResponse} from "@waspyro/steam-session/dist/constructs/Errors";
import {addFreeLicense, dynamicStoreData} from "../requests/profileRequests";
import StoreCart from "./StoreCart";
import SteamID from "steamid";
import parseDynamicStoreData from "../parsers/parseDynamicStoreData";
import {defaultify} from "../utils";
import {needsProp} from "../utils/decorators";

export default class Store extends SteamWebModule {

	constructor(steamWeb: SteamWeb) {
		super(steamWeb)
		this.#setDefaultStoreCookies()
	}

	private static SuccessfulJsonWithOneID = (id: Numberable) =>
		ExpectAndRun(statusOk, asJson, (res: any) => {
			id = String(id)
			if(!res[id]) throw new MalformedResponse(res, id)
			if(!res[id].success) throw new BadJSONStatus(res, [id.toString(), 'success'], [true], res[id]["success"])
			return res[id].data
		})

	getAppDetails(
		appid: Numberable, countryCode?: ECountry, filters?: AppDetailsFilters[]
	): Promise<AppDetails> {
		return this.request(false, appDetails, [appid], countryCode, filters)
		(Store.SuccessfulJsonWithOneID(appid))
	}

	getAppsPriceOverview(
		appids: Numberable[], countryCode?: ECountry
	): Promise<AppDetailsPriceOverviewResponse> {
		return this.request(false, appDetails, appids, countryCode, ['price_overview'])
		(ExpectAndRun(statusOk, asJson))
	}

	packageDetails(packageid: Numberable, countyCode?: ECountry): Promise<PackageDetails> {
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

	static #defaultStoreSearchParams = {
		ignore_preferences: 1, infinite: 1, force_infinite: 1,
		dynamic_data: 1, query: '', start: 0, count: 100,
	}

	search(params: StoreSearchParams): Promise<StoreSearchResponse & {results: ParsedStoreSearchResponse}> {
		defaultify(Store.#defaultStoreSearchParams, params)
		return this.request(false, storeSearch, params)
		(ExpectAndRun(statusOk, asSuccessJson, (json: any) => { //StoreSearchResponse
			json.results = parseStoreSearchResponse(json.results_html);
			return json
		}))
	}

	createCart(id?: string) {
		return new StoreCart(this.web, id)
	}

	addFreeLicense(subid: Numberable) {
		return this.request(true, addFreeLicense, this.web.session.sessionid, subid)
		(getSuccessfullText).then(text => {
			if(!text.includes('<h2>Success!</h2>')) throw new Error('Failed to add free license to account')
			return true
		})
	}

	dynamicStoreData = (): Promise<DynamicStoreTypes> => {
		return this.request(true, dynamicStoreData,
			new SteamID(this.web.session.steamid).accountid,
			this.web.props?.wallet?.country
		)(r => asJson(r, parseDynamicStoreData))
	}

	#defaultReviewForm = {
		rated_up: true, is_public: true,
		received_compensation: false, disable_comments: false
	}

	recommendGame = (
		review: AtLeast<Omit<StoreGameReviewForm, 'sessionid'>, 'appid' | 'comment' | 'language'>
	) : Promise<boolean> => {
		const r = defaultify(this.#defaultReviewForm, review) as StoreGameReviewForm
		r.sessionid = this.web.session.sessionid
		if(!r.steamworksappid) r.steamworksappid = r.appid
		return this.request(true, recommendGame, r)
		(ExpectAndRun(statusOk, asSuccessJson))
	}

	@needsProp('profile')
	deleteRecommendation(appid: Numberable) {
		return this.request(true, deleteRecommendation, appid, this.web.props.profileUrl, this.web.session.sessionid)
		(ExpectAndRun(statusOk, r => r.text()
			.then(html => !html.includes(this.web.props.profileUrl[2] + '/recommended/' + appid))
		))
	}

	#setDefaultStoreCookies() { //todo temporary cookies? use decorators?
		const store = this.web.session.cookies
		const url = new URL(uStore)
		const cookies = store.get(url)
		if(!cookies.get('birthtime')) store.add({
			domain: url.hostname,
			path: '/',
			name: 'birthtime',
			value: '880927201'
		})
		if(!cookies.get('lastagecheckage')) store.add({
			domain: url.hostname,
			path: '/',
			name: 'lastagecheckage',
			value: '1-0-1998'
		})
	}

}