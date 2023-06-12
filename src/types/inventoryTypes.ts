import {obj} from "steam-session/dist/common/types";

import {ProfileUrlParts} from "./profileTypes";

export type OpenBoosterPackResponse = {
	"success": 1 | number,
	"rgItems": {
		"image": string,
		"name": string,
		"series": number | 1,
		"foil": boolean
	}[]
}

//todo: collect samples, check if common response for
// 1. created market listings
// 2. inventory
// 3. market search
export type DescriptionsCommon = {
	appid: number,                              //MS ML
	classid: string,                            //MS
	instanceid: string,                         //MS
	currency: number,                           //MS ML
	tradable: number | 1 | 0,                   //MS
	name: string,                               //MS
	market_name: string,                        //MS
	market_hash_name: string,                   //MS
	commodity: number                           //MS
	market_tradable_restriction: number,        //MS
	market_marketable_restriction: number,      //MS
	marketable: number,                         //MS
	type: string,                               //MS

	background_color?: string,                  //MS
	icon_url?: string,                          //MS
	icon_url_large?: string,                    //MS
	descriptions?: obj[],                       //MS
} & obj

export type MarketDescription = {
	market_fee_app?: number,                    //MS-steam
	owner_actions?: obj[],                      //MS-steam
	name_color?: string                         //MS-tf MS-cs etc
	contextid: string                           //ML
} & DescriptionsCommon

export type Asset = {
	appid: number,
	contextid?: string,
	assetid: string,
	classid: string,
	instanceid: string,
	amount?: string
}

export type AssetsDescriptionsCollection = {
	assets: Asset[],
	descriptions: DescriptionsCommon[]
}

export type InventoryItemsResponse = {
	more_items: number,
	last_assetid: string,
	total_inventory_count: string,
	success: number,
	rwgrsn: number
	assets: Asset[]
	descriptions: DescriptionsCommon[]
}

export const KnownAppids = {
	'440': 'Team Fortress 2',
	'570': 'Dota 2',
	'620': 'Portal 2',
	'730': 'Counter-Strike: Global Offensive',
	'753': 'Steam',
	'578080': 'PUBG: BATTLEGROUNDS',
} as const

export type InventoryContexts<T = obj> = {
	[appid in keyof typeof KnownAppids | string]: {
		appid: number,
		name: string,
		icon: string,
		link: string,
		asset_count: number,
		inventory_logo: string,
		trade_permissions: string | 'FULL',
		load_failed: number | 0 | 1,
		store_vetted: string | '1',
		owner_only: boolean,
		rgContexts: {
			[contextid: '1' | '2' | '3' | '4' | '5' | '6' | string]: {
				asset_count: number,
				id: string,
				name: string
			} & obj & T
		}
  } & obj
}

export type InventoryRequestOpts = {
	steamid?: string,
	appid: string | number,
	contextid?: string | number,
	count?: number,
	language?: string,
	referer?: ProfileUrlParts
	startAssetid?: string,
}

export type WholeInventoryOpts = {
	steamid?: string,
	referer?: ProfileUrlParts,
	language?: string,
	count?: number
}

export type OneOfInventory = { steamid?: string, referer?: ProfileUrlParts }