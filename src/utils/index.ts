import {TradeofferAsset, TradeofferAssetRawMinimal} from "../types/tradeOfferTypes";
import {obj} from "steam-session/dist/common/types";
import {RequestConstructorReturns} from "../types";

export const EMPA = []
export const EMPO = {}
export const _ = undefined
export const U = undefined

export const uMake = (
    base: string | URL, path: (string|number)[] = EMPA,
    opts: obj = U, multiopts: obj[] = U,
    multioptsEncode: 'brackets' | 'ordered' | 'none' = 'none'
): URL => {
    const url = new URL([base, ...path].join('/'))
    if(opts) for(const k in opts)
        if(opts[k] !== U)
            url.searchParams.set(k, opts[k])

    if(multiopts) for(let i = 0; i <= multiopts.length; i++) {
        for(let k in multiopts[i]) {
            let out = k
            if(multioptsEncode === 'brackets') out += '[]'
            else if(multioptsEncode === 'ordered') out += '['+i+']'
            url.searchParams.append(out, multiopts[i][k])
        }
    }

    return url
}

export const defaultify = <T extends obj, Y extends obj>(defaultsObject: T, object?: Y): T&Y => {
    if(!object) return Object.assign({}, defaultsObject) as T&Y
    for(const key in defaultsObject)
        if(object[key] === undefined) (object[key] as any) = defaultsObject[key]
    return object as T&Y
}

export const wait = (time: number) => new Promise(r => setTimeout(r, time))

export const isDigitString = (str: string) => /^\d+$/.test(str)

export const normalizeTradeofferAssets = (
    assets: TradeofferAssetRawMinimal[]
): TradeofferAsset[] => assets.map(({appid, contextid, amount, assetid}) => ({
    appid: Number(appid),
    contextid: String(contextid),
    amount: Number(amount),
    assetid: String(assetid)
}))

export const WebApiGetRequestConstructor = <T extends any>(url: string) => (key: string, params: T) => [
    uMake(url, _, {key, format: 'json', input_json: JSON.stringify(params)}),
    {cookiesSet: 'manual', cookiesSave: 'manual'}
] as RequestConstructorReturns