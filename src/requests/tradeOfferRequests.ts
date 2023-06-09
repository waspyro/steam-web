import {_, EMPA, uMake} from "../utils";
import {
    uApiEconDeclineTradeV1,
    uApiEconGetTradeSummaryV1,
    uApiEconGetTradesV1,
    uApiEconGetTradeV1,
    uApiEconService,
    uCommunity,
    uTradeoffer,
    uTradeofferNew,
    uTradeofferNewSend
} from "../assets/urls";
import {BoolNum, Numberable, RequestConstructorReturns} from "../types";
import {ProfileUrlParts} from "../types/profileTypes";

const tradeofferPageUrl = (partner, token) => uMake(uTradeofferNew,_, {partner, token})

export const acceptTradeOffer = (
    sessionid: string, tradeofferid: string, partnerSteamID64: string,
    serverid: Numberable, captcha: string
) => [
    uMake(uTradeoffer, [tradeofferid, 'accept']), {
    method: 'POST',
    body: new URLSearchParams({sessionid, serverid, tradeofferid, partner: partnerSteamID64, captcha} as any),
    headers: {
        'Referer': uMake(uTradeoffer, [tradeofferid]).toString()
    }
}] as RequestConstructorReturns

export const cancelTradeOffer = (webapikey: string, tradeofferid: string) => [
    new URL(uApiEconService), {
    method: 'POST',
    body: new URLSearchParams({key: webapikey, tradeofferid}),
    autoCookies: false
}] as RequestConstructorReturns

export const declineTradeOffer = (webapikey: string, tradeofferid: string) => [
    new URL(uApiEconDeclineTradeV1), {
    method: 'POST',
    body: new URLSearchParams({key: webapikey, tradeofferid}),
    autoCookies: false
}] as RequestConstructorReturns

export const getTradeOffers = (webapi: string, {
    sent = 1, received = 1, descriptions = 1, onlyActive = 1, language = 'en', time = undefined
}) => [
    uMake(uApiEconGetTradesV1,_, {
        get_descriptions: descriptions,
        get_received_offers: received,
        get_sent_offers: sent,
        active_only: onlyActive,
        key: webapi,
        time_historical_cutoff: time, //todo: format
        language,
    }), {
    autoCookies: false
}] as RequestConstructorReturns

export const getTradeOffer = (webapikey: string, tradeofferid: string, descriptions: BoolNum, language = 'en') => [
    uMake(uApiEconGetTradeV1,_, {key: webapikey, tradeofferid, get_descriptions: descriptions, language}), {
    autoCookies: false
}] as RequestConstructorReturns

export const getTradeOffersSummary = (webapikey: string, timeLastVisitSec?: number) => [
    uMake(uApiEconGetTradeSummaryV1,_, {key: webapikey, time_last_visit: timeLastVisitSec}), {
    autoCookies: false
}] as const

export const sendTradeOffer = (
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
            version: 11,
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
    } as any)
}] as RequestConstructorReturns

export const tradeofferPrivacyPage = (profile: ProfileUrlParts) => [
    uMake(uCommunity, [profile[0], profile[1], 'tradeoffers', 'privacy'])
] as RequestConstructorReturns

export const tradeofferPage = (accountid: string, token: string) => [
    tradeofferPageUrl(accountid, token)
] as RequestConstructorReturns
