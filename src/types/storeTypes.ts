import {BoolNum} from "./index";
import {obj} from "@waspyro/steam-session/dist/common/types";

export type StoreSearchParamsOptional = {
	term?: string,
	sort_by?: 'Released_DESC' | 'Name_ASC' | 'Price_ASC' | 'Price_DESC' | 'Reviews_DESC' | string,
	'as-reviews-score'?: `${string}-${string}`,
	maxprice?: number | 'free',
	specials?: BoolNum,
	tags?: number[],
	category1?: number[],
	category2?: number[],
	category3?: number[],
	vrsupport?: number[],
	os?: string,
	supportedlang?: string[],
	'as-hide'?: 'cart' | 'ea' | 'mixed' | 'negative',
}

export type StoreSearchParamsRequired = {
	ignore_preferences: BoolNum,
	infinite: BoolNum,
	force_infinite: BoolNum,
	dynamic_data: BoolNum,
	query: '',
	start: number,
	count: number,
}

export type StoreSearchParams = Partial<StoreSearchParamsRequired> & StoreSearchParamsOptional

export type StoreSearchResponse = {
	success: BoolNum
	total_count: number
	start: number
	results_html: string
}

type PackageGroup = {
	name: 'default' | string,
	title: string,
	descriptions: string,
	selection_text: string,
	save_text: string,
	display_type: number,
	is_recurring_subscription: 'false' | 'true' | string,
	subs: {
		packageid: number,
		percent_savings_text: string,
		percent_savings: number,
		option_text: string,
		option_description: string,
		can_get_free_license: '0' | string,
		is_free_license: boolean,
		price_in_cents_with_discount: number
	}[]
}

type AppRequirements = [] | {minimum?: string, recommended?: string} & obj

export type AppDetails = Partial<{
	type: string,
	name: string,
	steam_appid: number,
	required_age: number,
	is_free: boolean,
	dls: number[],
	detailed_description: string,
	about_the_game: string,
	short_description: string,
	supported_languages: string,
	header_image: string,
	website: null | string,
	pc_requirements: AppRequirements,
	mac_requirements: AppRequirements,
	linux_requirements: AppRequirements,
	developers: string
	publishers: string[],
	packages: number[]
	package_groups: PackageGroup[],
	platforms: {windows: boolean, mac: boolean, linux: boolean} & obj,
	metacritic: {
		score: number,
		url: string
	}
	categories: {id: number, descriptions: string}[]
	genres: {id: string, descriptions: string}[]
	screenshots: {id: number, path_thumbnail: string, path_full: string}[]
	movies: {id: number, name: string, thumbnail: string, webm: obj, mp4: obj, highlight: boolean}[]
	recommendations: {total: number} & obj
	achievements: {name: string, path: string}
	release_date: {coming_soon: boolean, date: string},
	support_info: {url: string, email: string},
	background: string,
	background_raw: string,
	content_descriptors: {ids: number[], notes: string} & obj,
	price_overview: {
		currency: string,
		initial: number,
		final: number,
		discount_percent: number
		initial_formatted: string
		final_formatted: string
	}
}>

export type AppDetailsFilters = 'packages' | 'price_overview' | string

// this does not work 🤡
// export type AppDetailsResponse = {
//     [appid: string]: {
//         success: true,
//         data: AppDetails | []
//     } | {
//         success: false
//     }
// }
//
// const hello = (app: string, data: AppDetailsResponse) => {
//     if(data[app].success) data[app].data //<<< why?
// }

export type AppDetailsResponse = {
	[appid: string]: {
		success: boolean,
		data: AppDetails
	}
}

export type AppDetailsPriceOverviewResponse = {
	[appid: string]: {
		success: boolean,
		data?: Pick<AppDetails, 'price_overview'>
	}
}

export type PackageDetails = Partial<{
	name: string,
	page_image: string,
	small_logo: string,
	apps: {id: number, name: string}[],
	price: {
		currency: string,
		initial: number,
		final: number,
		discount_percent: number,
		individual: number
	},
	platforms: { windows: boolean, mac: boolean, linux: boolean } & obj,
	controller: { full_gamepad: boolean } & obj,
	release_date: { coming_soon: boolean, date: string } & obj
}>

export type PackageDetailsResponse = {
	[packageid: string]: {
		success: boolean,
		data?: PackageDetails
	}
}

export type DynamicStoreTypes = {
	wishlist: number[],
	ownedPackages: number[],
	ownedApps: number[],
	followedApps: number[],
	masterSubApps: number[],
	packagesInCart: number[],
	appsInCart: number[],
	recommendedTags: {tagid: number, name: string}[],
	ignoredApps: Record<string, number> | [],
	ignoredPackages: Record<string, number> | [],
	curators: Record<string, {clanid: number, avatar: string, name: string}> | [],
	curatorsIgnored: Record<string, any> | [],
	curations: Record<string, Record<string, number>> | [],
	showFilteredUserReviewScores: boolean,
	creatorsFollowed: number[],
	creatorsIgnored: number[],
	excludedTags: number[] | any,
	excludedContentDescriptorIDs: number[],
	autoGrantApps: number[],
	recommendedApps: number[],
	preferredPlatforms: string[],
	primaryLanguage: number,
	secondaryLanguages: number[],
	allowAppImpressions: boolean | BoolNum, //???
	cartLineItemCount: number,
	remainingCartDiscount: number,
	totalCartDiscount: number
}

export type StoreGameReviewForm = {
	appid: number,
	steamworksappid: number,
	comment: string,
	rated_up: boolean,
	is_public: boolean,
	language: string,
	received_compensation: BoolNum,
	disable_comments: BoolNum,
	sessionid: string
}