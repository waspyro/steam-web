import {uCommunity, uInventory} from "../assets/urls";
import {uMake} from "../utils";
import {RequestConstructor} from "../types";
import {InventoryRequestOpts} from "../types/inventoryTypes";
import {ProfileUrlParts} from "../types/profileTypes";

export const inventoryItems = (
    {steamid, appid, contextid, count, startAssetid: start_assetid, language: l, referer}: InventoryRequestOpts
) => {
    const url = uMake(uInventory, [steamid, appid, contextid], {l, count, start_assetid})
    const headers = {'X-Requested-With': 'XMLHttpRequest'} as any
    if(referer) headers.Referer = uMake(uCommunity, [referer[0], referer[1], 'inventory']).toString()
    return [url, {headers}] as const
}

export const inventoryPage: RequestConstructor = (
    [type, id]: ProfileUrlParts
) => {
    return [uMake(uCommunity, [type, id, 'inventory']), {followRedirects: 2}]
}

export const unpackBooster= (
    sessionid: string, [type, id]: ProfileUrlParts, appid: string, assetid: string
) => {
    const base = uMake(uCommunity, [type, id])
    const Referer = uMake(base, ['inventory']).toString()
    return [uMake(base, ['ajaxunpackbooster']), {
        method: 'POST',
        body: new URLSearchParams({appid: String(appid), communityitemid: assetid, sessionid}),
        headers: {Origin: uCommunity, Referer}
    }] as const
}

