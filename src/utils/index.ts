import {obj} from "steam-session/dist/extra/types";

export const EMPA = []
export const EMPO = {}

export const uMake = (base: string | URL, path: (string|number)[] = EMPA, opts: obj = EMPO) => {
    const url = new URL([base, ...path].join('/'))
    for(const k in opts)
        if(opts[k] !== undefined)
            url.searchParams.set(k, opts[k])
    return url
}

export const defaultify = <T extends obj, Y extends obj>(defaultsObject: T, object?: Y): T&Y => {
    if(!object) return Object.assign({}, defaultsObject) as T&Y
    for(const key in defaultsObject)
        if(object[key] === undefined) (object[key] as any) = defaultsObject[key]
    return object as T&Y
}

export const wait = (time: number) => new Promise(r => setTimeout(r, time))