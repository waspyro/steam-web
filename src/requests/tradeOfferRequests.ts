import {_, EMPA, U, uMake} from "../utils";
import {
    uApiEconDeclineTradeV1, uApiEconGetTradeSummaryV1,
    uApiEconGetTradesV1,
    uApiEconGetTradeV1,
    uApiEconService, uCommunity, uTradeofferNew, uTradeofferNewSend,
    uTradeoffer
} from "../assets/urls";
import {BoolNum, ProfileUrlParts, RequestConstructor} from "../types";

export const acceptTradeOffer: RequestConstructor = (
    sessionid: string, tradeofferid: string, partner: string, serverid: string, captcha: string
) => [
    uMake(uTradeoffer, [tradeofferid, 'accept']), {
    method: 'POST',
    body: new URLSearchParams({sessionid, serverid, tradeofferid, partner, captcha}),
    headers: {
        'Referer': uMake(uTradeoffer, [tradeofferid]).toString()
    }
}] as const

export const cancelTradeOffer: RequestConstructor = (webapikey: string, tradeofferid: string) => [
    new URL(uApiEconService), {
    method: 'POST',
    body: new URLSearchParams({key: webapikey, tradeofferid})
}] as const

export const declineTradeOffer: RequestConstructor = (webapikey: string, tradeofferid: string) => [
    new URL(uApiEconDeclineTradeV1), {
    method: 'POST',
    body: new URLSearchParams({key: webapikey, tradeofferid})
}] as const

export const getTradeOffers: RequestConstructor = (webapi: string, {
    sent = 1, received = 1, descriptions = 1, onlyActive = 1, language = 'en', time
}) => [
    uMake(uApiEconGetTradesV1,_, {
        get_descriptions: descriptions,
        get_received_offers: received,
        get_sent_offers: sent,
        active_only: onlyActive,
        key: webapi,
        time_historical_cutoff: time, //todo: format
        language,
    })
] as const

export const getTradeOffer: RequestConstructor = (webapikey: string, tradeofferid: string, descriptions: BoolNum) => [
    uMake(uApiEconGetTradeV1,_, {key: webapikey, tradeofferid, get_descriptions: descriptions})
] as const

export const getTradeOffersSummary: RequestConstructor = (webapikey: string, timeLastVisitSec: number) => [
    uMake(uApiEconGetTradeSummaryV1,_, {key: webapikey, time_last_visit: timeLastVisitSec})
] as const

const tradeofferPageUrl = (partner, token) => uMake(uTradeofferNew,_, {partner, token})

export const sendTradeOffer: RequestConstructor = (
    sessionid: string,
    partnerSid64: string,
    partnerAccountID: string,
    partnerToken: undefined | string,
    myItems = EMPA, themItems = EMPA,
    message = '', captcha = '', serverid = 1
) => [
    new URL(uTradeofferNewSend), {
    method: 'POST',
    headers: {
        Referer: tradeofferPageUrl(partnerAccountID, partnerToken).toString()
    },
    body: new URLSearchParams({
        json_tradeoffer: JSON.stringify({
            newversion: true,
            version: 2,
            me: {
                assets: myItems,
                currency: EMPA,
                ready: true
            },
            them: {
                assets: themItems,
                currency: EMPA,
                ready: true
            }
        }),
        trade_offer_create_params: partnerToken ?
            `{"trade_offer_access_token":"${partnerToken}"}` : '{}',
        tradeoffermessage: message,
        serverid,
        sessionid,
        partner: partnerSid64,
        captcha
    })
}] as const

export const tradeofferPrivacyPage: RequestConstructor = (profile: ProfileUrlParts) => [
    uMake(uCommunity, [profile[0], profile[1], 'tradeoffers', 'privacy'])
] as const

const tradeofferPage: RequestConstructor = (accountid: string, token: string) => [
    tradeofferPageUrl(accountid, token)
] as const