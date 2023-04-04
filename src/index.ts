import SteamSession from "steam-session";
import Inventory from "./modules/Inventory";
import {ProfileUrlParts} from "./types";
import {wait} from "./utils";
import {RequestOpts} from "steam-session/dist/extra/types";
import {getResponseAndDrain, ResponseProcessor} from "./utils/responseProcessors";
import Listenable from "listenable";

type Props = {
    profileUrl: ProfileUrlParts
}

export default class SteamWeb {
    constructor(public readonly session: SteamSession = new SteamSession()) {}

    events = {
        responseError: new Listenable<{ //temporary
            url: URL
            opts: RequestOpts,
            authorized: boolean,
            responseProcessor: ResponseProcessor,
            error: any,
            triesLeft: number,
            retryDelay: number
        }>()
    }

    //todo: this function should not retry on its own, but redirect details to somewhere to make a decision
    processRequest(
        authorized: boolean,
        url: URL,
        opts?: RequestOpts,
        responseProcessor: ResponseProcessor = getResponseAndDrain
    ): Promise<ReturnType<typeof responseProcessor>> {
        const request = this.session[authorized ? 'authorizedRequest' : 'request']
        let triesLeft = 5, retryDelay = 500
        const run = () => request(url, opts)
            .then(responseProcessor)
            .catch(error => {
                this.events.responseError.emit({
                    url, opts, authorized,
                    responseProcessor, error, triesLeft, retryDelay
                })
                if(triesLeft-- < 0) throw error
                return wait(retryDelay *= 2).then(run)
            })
        return run()
    }

    processRequestBond = (authorized: boolean, url: URL, opts?: RequestOpts) =>
        (responseProcessor: ResponseProcessor): ReturnType<ResponseProcessor> =>
            this.processRequest(authorized, url, opts, responseProcessor)

    inventory = new Inventory(this)

    props: Props = {
        profileUrl: null
    }

    async updateMyProfileURL() {
        const profile = await this.session.me()
        if(!profile) throw new Error('Unable to get profile url')
        return this.props.profileUrl = [profile[2], profile[1], profile[0]]
    }

}