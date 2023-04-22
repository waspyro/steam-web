import SteamWeb from "../SteamWeb";
import {Numberable} from "../types";

type NameidCB = (err: Error, nameid: string) => void

type Requests = {
    appid: number, contextid: number, hashnamesTotal: number,
    hashnames: {[market_hash_name: string]: NameidCB[]}
}

type ItemToAssign = {
    contextid: Numberable,
    appid: Numberable,
    market_hash_name: string
}

export default class NameIDCollector {

    constructor(
        private getItemNameIDs: SteamWeb['market']['getItemsNameIDs'],
        private perRequestDelay = 5000,
        private maxItemsPerRequest = 50
    ) {}

    #isFree = true
    #queue: Requests[] = []

    #run = () => {
        const requests = this.#queue[0]
        this.getItemNameIDs(requests.appid, requests.contextid, Object.keys(requests.hashnames))
            .then(hashnames_nameids => {
                for (const hashname of Object.keys(hashnames_nameids))
                for (const cb of requests.hashnames[hashname])
                    cb(null, hashnames_nameids[hashname])
            }).catch(e => {
                for (const cbs of Object.values(requests.hashnames))
                for (const cb of cbs) cb(e, null)
            }).finally(() => {
                this.#queue.shift()
                setTimeout(() => {
                    if(!this.#queue.length) return this.#isFree = true
                    else this.#run()
                }, this.perRequestDelay)
            })
    }

    get = (appid: Numberable, contextid: Numberable, market_hash_name: string, callback: NameidCB) => {
        appid = Number(appid)
        contextid = Number(contextid)
        let i = 0, found = false
        for(;i < this.#queue.length; i++) {
            const requests = this.#queue[i]
            if(requests.appid !== appid || requests.contextid !== contextid) continue
            if(requests.hashnames[market_hash_name]) {
                requests.hashnames[market_hash_name].push(callback)
                found = true; break
            } else if((i > 0 || this.#isFree) && requests.hashnamesTotal < this.maxItemsPerRequest) {
                requests.hashnames[market_hash_name] = [callback]
                requests.hashnamesTotal++
                found = true; break
            }
        }

        if(!found) this.#queue.push({
            appid, contextid, hashnamesTotal: 1,
            hashnames: {[market_hash_name]: [callback]}
        })

        if(this.#isFree) setImmediate(() => { //this should be a bit faster like so :)
            if (this.#isFree) {
                this.#isFree = false
                this.#run()
            }
        })

        return i
    }

    getp = (appid: Numberable, contextid: Numberable, market_hash_name: string): Promise<string> =>
        new Promise((resolve, reject) =>
            this.get(appid, contextid, market_hash_name, (err, res) =>
                err ? reject(err) : resolve(res)))

    assign = <T extends ItemToAssign, K extends string = 'nameid'>
    (item: T, assignAs?: K): Promise<T & Record<K, string>>  => {
        if(!assignAs) (assignAs as any) = 'nameid'
        return this.getp(item.appid, item.contextid, item.market_hash_name)
            .then(nameid => {
                (item as any)[assignAs] = nameid
                return item as T & Record<K, string>
            })
    }
}