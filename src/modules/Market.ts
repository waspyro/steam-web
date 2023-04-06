import SteamWebModule from "./SteamWebModule";
import {Item, listingPage, multisellPage} from "../requests/Market";
import {getSuccessfullText} from "../utils/responseProcessors";
import parseNameidFromLisngPage from "../parsers/parseNameidFromListingPage";
import parseNameidFromMultisellPage from "../parsers/parseNameidFromMultisellPage";
import {ErrorWithContext} from "../utils/errors";

export default class Market extends SteamWebModule {

    getItemNameID(item: Item) {
        return this.request(false, listingPage, item)
        (getSuccessfullText).then(parseNameidFromLisngPage)
    }

    getItemsNameIDs<T extends ReadonlyArray<string>>(
        appid: string, contextid: string, hashnames: T
    ): Promise<{ [K in T[number]]: string }>  {
        return this.request(true, multisellPage, appid, contextid, hashnames)
        (getSuccessfullText).then(html => {
            const [nameids, parsedHashNames] = parseNameidFromMultisellPage(html)
            if(parsedHashNames.length !== hashnames.length) throw new Error('got unexpected results')

            const results = {}
            for(let i = 0; i < parsedHashNames.length; i++)
                results[nameids[i]] = nameids[i]

            const namesMissing = []
            for(const name of hashnames)
                if(!results[name]) namesMissing.push(name)
            if(namesMissing.length) throw new ErrorWithContext('Unable to find some nameids', {
                namesRequired: hashnames, namesMissing, results
            })

            return results as { [K in T[number]]: string }
        })
    }

}


function toObject<T extends ReadonlyArray<string>>(array: T): { [K in T[number]]: string } {
    const object = {} as { [K in T[number]]: string };
    for (const el of array) object[el] = 'hello';
    return object;
}

const res = toObject(['foo', 'baz'] as const);
res.foo.toString()