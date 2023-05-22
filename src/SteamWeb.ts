import SteamSession from "steam-session";
import Inventory from "./modules/Inventory";
import {ProfileUrlParts, RequestConstructor} from "./types";
import {ResponseProcessor} from "./utils/responseProcessors";
import Listenable from "listenable";
import WebApi from "./modules/WebApi";
import Market from "./modules/Market";
import {Trade} from "./modules/Trade";
import Store from "./modules/Store";
import {RequestOpts} from "steam-session/dist/common/types";
import Profile from "./modules/Profile";

type Props = {
    profileUrl: ProfileUrlParts,
    webapi: string
}

export default class SteamWeb {
    readonly #forceAuthorized = null
    constructor(public readonly session: SteamSession = new SteamSession({}), {forceAuthorized = true} = {}) {
        this.#forceAuthorized = forceAuthorized
    }

    events = {
        responseError: new Listenable<{ //temporary
            url: URL
            opts: RequestOpts,
            authorized: boolean,
            responseProcessor: ResponseProcessor,
            error: any,
            triesLeft: number,
            retryDelay: number
        }>(),
        mobileConfirmationRequired: new Listenable<[
            from: 'market' | 'trade',
            item?: any
        ]>(),
        emailConfirmationRequired: new Listenable<[
            from: 'market' | 'trade',
            item?: any,
            emailTip?: string,
        ]>()
    }

    registerRequest = (meta) => Promise.resolve(true)
    registerError = (error, meta) => {
        return Promise.reject(error)
        // if(meta.tries > 1) return Promise.reject(error)
        // else return Promise.resolve()
    }

    processRequest = <RC extends RequestConstructor>(
        authorized: boolean,
        requestConstructor: RC,
        ...requestConstructorArgs: Parameters<RC>
    ) => <T extends any>(
        responseProcessor: (response: Awaited<ReturnType<SteamSession['request']>>) => T
    ): T => {
        const request = this.session[(this.#forceAuthorized || authorized) ? 'authorizedRequest' : 'request']
        const [url, opts] = requestConstructor(...requestConstructorArgs)
        const meta = {tries: 0, url, opts, requestConstructorArgs, requestConstructor, authorized}
        const run = () => {
            meta.tries++
            return this.registerRequest(meta)
                .then(() => request(url, opts))
                .then(responseProcessor)
                .catch(error => this.registerError(error, meta)
                    .then(run))
        }
        return run()
    }

    inventory = new Inventory(this)
    webapi = new WebApi(this)
    market = new Market(this)
    trade = new Trade(this)
    store = new Store(this)
    profile = new Profile(this)

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