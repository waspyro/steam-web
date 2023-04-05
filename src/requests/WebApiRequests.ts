import SteamWeb from "../index";
import {uApiKey, uApiKeyRegister, uApiKeyRevoke} from "../assets/urls";
import {EMPA, uMake} from "../utils";

export default class WebApiRequests {
    request: SteamWeb['processRequestBond']

    constructor(private web: SteamWeb) {
        this.request = web.processRequestBond
    }

    apikeyPage = () => {
        return this.request(true, uMake(uApiKey, EMPA, {l: 'english'}))
    }

    register = (sessionid: string, domain: string) => {
        return this.request(true, uMake(uApiKeyRegister), {
            method: 'POST',
            body: new URLSearchParams({sessionid, domain, agreeToTerms: 'agreed', Submit: 'Register'})
        })
    }

    revoke = (sessionid: string) => {
        return this.request(true, new URL(uApiKeyRevoke), {
            method: 'POST',
            body: new URLSearchParams({sessionid, Revoke: 'Revoke+My+Steam+Web+API+Key'})
        })
    }

}