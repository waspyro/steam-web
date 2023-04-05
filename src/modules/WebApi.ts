import SteamWeb from "../index";
import WebApiRequests from "../requests/WebApiRequests";
import {getSuccessfullText} from "../utils/responseProcessors";
import parseWebApiPage from "../parsers/parseWebApiPage";

export default class WebApi {
    requests: WebApiRequests

    constructor(private web: SteamWeb) {
        this.requests = new WebApiRequests(web)
    }

    check() {
        return this.requests.apikeyPage()(getSuccessfullText).then(text => {
            const key = parseWebApiPage(text)
            if(key.status === 'exists') this.web.props.webapi = key.key
            return key
        })
    }

    revoke() {
        return this.requests.revoke(this.web.session.sessionid)
        (getSuccessfullText).then(text => {
            const key = parseWebApiPage(text)
            if(key.status === 'exists') throw new Error('unable to revoke key')
            this.web.props.webapi = null
            return key
        })
    }

    register(domain: string) {
        return this.requests.register(this.web.session.sessionid, domain)
        (getSuccessfullText).then(text => {
            const key = parseWebApiPage(text)
            if(key.status !== 'exists') throw new Error('unable to register key')
            this.web.props.webapi = key.key
            return key.key
        })
    }

    getOrSet(domain: string, reRegisterOnDomainMismatch = false) {
        return this.check().then(key => {
            if(key.status === 'canRegister') return this.register(domain)
            if(reRegisterOnDomainMismatch && key.domain !== domain)
                return this.revoke().then(() => this.register(domain))
            return key.key
        })
    }

}