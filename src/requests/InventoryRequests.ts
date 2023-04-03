import SteamWeb from "../index";
import {uCommunity, uInventory} from "../assets/urls";
import {uMake} from "../utils";
import {obj} from "steam-session/dist/extra/types";
import {InventoryRequestOpts, ProfileUrlParts} from "../types";

export default class InventoryRequests {
    constructor(private web: SteamWeb) {}

    inventoryItems = ({
      steamid, appid, contextid, count, startAssetid: start_assetid,
      language: l, referer: Referer}: InventoryRequestOpts
    ) => {
        const url = uMake(uInventory, [steamid, appid, contextid], {l, count, start_assetid})
        const headers = {Referer, 'X-Requested-With': 'XMLHttpRequest'}
        return this.web.session.request(url, {headers})
    }

    inventoryPage = ([type, id]: ProfileUrlParts) => {
        return this.web.session.request(uMake(uCommunity, [type, id, 'inventory']), {followRedirects: 2})
    }

}

export type descriptionCommon = {
    appid: number,
    classid: string,
    instanceid: string,
    currency: number,
    tradable: number | 1 | 0,
    name: string,
    market_name: string,
    market_hash_name: string,
    commodity: number
    market_tradable_restriction: number,
    market_marketable_restriction: number,
    marketable: number
} & obj

export type asset = {
    appid: number,
    contextid?: string,
    assetid: string,
    classid: string,
    instanceid: string,
    amount: string
}

export type InventoryItemsResponse = {
    more_items: number,
    last_assetid: string,
    total_inventory_count: string,
    success: number,
    rwgrsn: number
    assets: asset[]
    descriptions: descriptionCommon[]
}

export const KnownAppids = {
    '440': 'Team Fortress 2',
    '570': 'Dota 2',
    '620': 'Portal 2',
    '730': 'Counter-Strike: Global Offensive',
    '753': 'Steam',
    '578080': 'PUBG: BATTLEGROUNDS',
} as const

export type InventoryContexts = {
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
            } & obj
        }
    } & obj
}