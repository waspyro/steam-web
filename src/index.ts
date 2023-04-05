import SteamSession from "steam-session";
import Inventory from "./modules/Inventory";
import {ProfileUrlParts} from "./types";
import {RequestOpts} from "steam-session/dist/extra/types";
import {getResponseAndDrain, ResponseProcessor} from "./utils/responseProcessors";
import Listenable from "listenable";
import WebApi from "./modules/WebApi";

type Props = {
    profileUrl: ProfileUrlParts,
    webapi: string
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

    registerRequest = (meta) => Promise.resolve(true)       //there should be global request limiters
    registerError = (error, meta) => Promise.reject(error)  //there may be some global error handling strategies

    processRequest = <ARGS extends Array<any>, Y extends readonly [URL, RequestOpts?]>(
        authorized: boolean,
        requestConstructor: (...args: ARGS) => Y, //the easiest way to identify request for limiter and catcher
        ...requestConstructorArgs: ARGS           //useful for debugging
    ) => (
        //by design: this should check that response comes as expected i.e. no timeout and no steam is down
        //but maybe all response should be handled by this...
        responseProcessor: ResponseProcessor = getResponseAndDrain
    ): ReturnType<typeof responseProcessor> => {
        const request = this.session[authorized ? 'authorizedRequest' : 'request']
        const [url, opts] = requestConstructor(...requestConstructorArgs)
        const meta = {tries: 0, url, opts, requestConstructorArgs, requestConstructor, authorized}
        const run = () => {
            meta.tries++
            return this.registerRequest(meta).then(() => request(url, opts))
                .then(responseProcessor)
                .catch(error => this.registerError(error, meta).then(run))
        }
        return run()
    }

    inventory = new Inventory(this)
    webapi = new WebApi(this)

    props: Props = {
        profileUrl: null,
        webapi: null
    }

    async updateMyProfileURL() {
        const profile = await this.session.me()
        if(!profile) throw new Error('Unable to get profile url')
        return this.props.profileUrl = [profile[2], profile[1], profile[0]]
    }

}