import SteamWeb from "../SteamWeb";
import {getSuccessfullText} from "../utils/responseProcessors";
import parseWebApiPage from "../parsers/parseWebApiPage";
import {apikeyPage, register, revoke} from "../requests/webApiRequests";

export default class WebApi {
    private readonly request: SteamWeb['processRequest']

    constructor(private web: SteamWeb) {
        this.request = web.processRequest
    }

    check() {
        return this.request(true, apikeyPage)(getSuccessfullText).then(text => {
            const key = parseWebApiPage(text)
            if(key.status === 'exists') this.web.props.webapi = key.key
            return key
        })
    }

    revoke() {
        return this.request(true, revoke, this.web.session.sessionid)
        (getSuccessfullText).then(text => {
            const key = parseWebApiPage(text)
            if(key.status === 'exists') throw new Error('unable to revoke key')
            this.web.props.webapi = null
            return key
        })
    }

    register(domain: string) {
        return this.request(true, register, this.web.session.sessionid, domain)
        (getSuccessfullText).then(text => {
            const key = parseWebApiPage(text)
            if(key.status !== 'exists') throw new Error('unable to register key')
            this.web.props.webapi = key.key
            return key.key
        })
    }

    update(domain: string = 'localhost', reRegisterOnDomainMismatch = false) {
        return this.check().then(key => {
            if(key.status === 'canRegister') return this.register(domain)
            if(reRegisterOnDomainMismatch && key.domain !== domain)
                return this.revoke().then(() => this.register(domain))
            return key.key
        })
    }

}