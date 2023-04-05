import {uApiKey, uApiKeyRegister, uApiKeyRevoke} from "../assets/urls";
import {EMPA, uMake} from "../utils";
import {RequestConstructor} from "../types";

export const apikeyPage: RequestConstructor = () => [
    uMake(uApiKey, EMPA, {l: 'english'})
]

export const register: RequestConstructor = (sessionid: string, domain: string) => [
    uMake(uApiKeyRegister), {
    method: 'POST', body: new URLSearchParams({sessionid, domain, agreeToTerms: 'agreed', Submit: 'Register'})
}]

export const revoke: RequestConstructor = (sessionid: string) => [
    new URL(uApiKeyRevoke) as URL, {
    method: 'POST', body: new URLSearchParams({sessionid, Revoke: 'Revoke+My+Steam+Web+API+Key'})
}]