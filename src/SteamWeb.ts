import SteamSession from "@waspyro/steam-session";
import Inventory from "./modules/Inventory";
import {RequestConstructor, SteamWebConstructorParams} from "./types";
import {ResponseProcessor} from "./utils/responseProcessors";
import Listenable from "echolator";
import WebApi from "./modules/WebApi";
import Market from "./modules/Market";
import {Trade} from "./modules/Trade";
import Store from "./modules/Store";
import {RequestOpts, SteamSessionRestoreConstructorParams} from "@waspyro/steam-session/dist/common/types";
import Profile from "./modules/Profile";
import {ProfileUrlParts} from "./types/profileTypes";
import {RGWalletInfo} from "./parsers/parseWallet";

type Props = {
    profileUrl: ProfileUrlParts,
    webapi: string,
    wallet: RGWalletInfo<number>
}

export default class SteamWeb {
    readonly #forceAuthorized
    readonly meta: SteamWebConstructorParams['meta']

    constructor(
        public readonly session: SteamSession = new SteamSession({}),
        opts: SteamWebConstructorParams = {})
    {
        this.#forceAuthorized = opts.forceAuthorized ?? false
        const meta = opts.meta ?? {} as any
        if(!meta.viewport) meta.viewport = {}
        if(!meta.viewport.height) meta.viewport.height = 1050
        if(!meta.viewport.width) meta.viewport.width = 1680
        this.meta = meta as SteamWebConstructorParams['meta']
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
        ]>(),
        propUpdated: new Listenable<[
            name: keyof Props,
            value: Props[keyof Props]
        ]>() //i don't know how to make this generic :)
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

    //todo: {updated, update, value}, external access with getProp or getUpdatedProp
    props: Props = {
        profileUrl: null,
        webapi: null,
        wallet: null
    }

    setProp<K extends keyof Props>(name: K, value: Props[K]) {
        this.props[name] = value
        this.events.propUpdated.emit([name, value])
        return value
    }

    async updateMyProfileURL() {
        const profile = await this.session.me()
        if(!profile) throw new Error('Unable to get profile url')
        return this.setProp('profileUrl', [profile[2], profile[1], profile[0]])
    }

    // on the edge
    static fromRestoredSession = (
      params: SteamSessionRestoreConstructorParams & SteamWebConstructorParams,
    ) => SteamSession.restore(params).then(session => new SteamWeb(session, params))

}