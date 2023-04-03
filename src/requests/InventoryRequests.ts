import SteamWeb from "../index";
import {uCommunity, uInventory} from "../assets/urls";
import {uMake} from "../utils";
import {obj} from "steam-session/dist/extra/types";
import {InventoryRequestOpts} from "../types";

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

    inventoryPage = ([profiletype, profileid]) => {
        return this.web.session.request(uMake(uCommunity, [profiletype, profileid]))
    }

}

export type descriptionCommon = {
    appid: number,
    classid: string,
    instanceid: string,
    currency: number,
    tradable: number,
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
    contextid: string,
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

