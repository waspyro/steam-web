import SteamWebModule from "./SteamWebModule";
import {
    acceptTradeOffer,
    cancelTradeOffer,
    getTradeOffer,
    getTradeOffers,
    getTradeOffersSummary, sendTradeOffer, tradeofferPage, tradeofferPrivacyPage
} from "../requests/tradeOfferRequests";
import {asJson, asJsonWithField, asSuccessJson, asText, ExpectAndRun, statusOk} from "../utils/responseProcessors";
import {needsProp} from "../utils/decorators";
import {
    AcceptTradeOfferResponse,
    CEconTradeOffer,
    GetTradeOffersResponse,
    GetTradeOffersSummaryResponse, SendTradeOfferResponse,
    TradeofferAssetRawMinimal
} from "../types/tradeOfferTypes";
import {BoolNum} from "../types";
import {ErrorWithContext} from "../utils/errors";
import SteamID from "steamid";
import {EMPA, normalizeTradeofferAssets} from "../utils";
import parseTradeofferPage from "../parsers/parseTradeofferPage";
import {MalformedResponse} from "steam-session/dist/constructs/Errors";

export class Trade extends SteamWebModule {

    //todo: accept awaiting based on amount of items transfered – builtin or via manager helper util
    //todo: check if confirmation required?
    acceptTradeOffer(tradeofferid: string, partnerSteamID: string): Promise<AcceptTradeOfferResponse> {
        return this.request(true, acceptTradeOffer, this.web.session.sessionid, tradeofferid, partnerSteamID, 1, '')
        (ExpectAndRun(statusOk, asJson))
    }

    @needsProp('webapi')
    cancelTradeOffer(tradeofferid: string) { //todo: return type
        return this.request(false, cancelTradeOffer, this.web.props.webapi, tradeofferid)
        (ExpectAndRun(statusOk, asSuccessJson))
    }

    @needsProp('webapi')
    declineTradeOffer(tradeofferid: string) { //todo: return type
        return this.request(false, cancelTradeOffer, this.web.props.webapi, tradeofferid)
        (ExpectAndRun(statusOk, asSuccessJson))
    }

    @needsProp('webapi')
    getTradeOffers(): Promise<GetTradeOffersResponse['response']> {
        return this.request(false, getTradeOffers, this.web.props.webapi, {})
        (ExpectAndRun(statusOk, asJsonWithField('response'))).then(normalizeTradeOffersResponse)
    }

    @needsProp('webapi')
    getTradeOffer(tradeofferid: string, descriptsions: BoolNum = 0): Promise<CEconTradeOffer> {
        return this.request(false, getTradeOffer, this.web.props.webapi, tradeofferid, descriptsions)
        (ExpectAndRun(statusOk, asJson, r => {
            //with or without descriptions it's not returning them, so it's just offer
            if(!r.response || !r.response.offer) throw new ErrorWithContext('missing response offer', r)
            return normalizeCEconTradeOffer(r.response.offer)
        }))
    }

    @needsProp('webapi')
    getTradeOffersSummary(timeLastVisitSec?: number): Promise<GetTradeOffersSummaryResponse> {
        return this.request(false, getTradeOffersSummary, this.web.props.webapi, timeLastVisitSec)
        (ExpectAndRun(statusOk, asJsonWithField('response')))
    }

    sendTradeOffer(
        partnerSteamID: SteamID, partnerToken?: string,
        myItems: TradeofferAssetRawMinimal[] = EMPA,
        themItems: TradeofferAssetRawMinimal[] = EMPA,
        message = '', captcha = '',
        serverid = 1
    ): Promise<SendTradeOfferResponse> {
        if(myItems.length + themItems.length === 0) throw new Error('Unable to send empty tradeoffer')
        return this.request(true, sendTradeOffer,
            this.web.session.sessionid,
            partnerSteamID.getSteamID64(),
            partnerSteamID.accountid.toString(),
            partnerToken,
            normalizeTradeofferAssets(myItems),
            normalizeTradeofferAssets(themItems),
            message, captcha, serverid)
        (ExpectAndRun(statusOk, asJson, (resp: SendTradeOfferResponse) => {
            if(!resp.tradeofferid) throw new MalformedResponse(resp, 'tradeofferid')
            if(resp.needs_mobile_confirmation)
                this.web.events.mobileConfirmationRequired.emit(['trade', resp.tradeofferid])
            if(resp.needs_email_confirmation)
                this.web.events.emailConfirmationRequired.emit(['trade', resp.tradeofferid, resp.email_domain])
            return resp
        }))
    }

    @needsProp('profile')
    getAccountTradeOfferToken(): Promise<string> {
        return this.request(true, tradeofferPrivacyPage, this.web.props.profileUrl)
        (ExpectAndRun(statusOk, asText, html => {
            const match = html.match(/id="trade_offer_access_url" value="(.+)"/)
            if(!match) throw new Error('Unable to find url with token on the page')
            const url = match[1]
            return url.split('token=')[1]
        }))
    }

    checkTradeofferPartnerDetails(accountid: string, token?: string) {
        this.request(true, tradeofferPage, accountid, token)
        (ExpectAndRun(statusOk, asText, parseTradeofferPage))
    }

}

const normalizeCEconTradeOffer = (offer: CEconTradeOffer) => {
    if(!offer.items_to_give) offer.items_to_give = []
    else if(!offer.items_to_receive) offer.items_to_receive = []
    return offer
}

const normalizeTradeOffersResponse = (tradeOffers: GetTradeOffersResponse['response']) => {
    if(!tradeOffers.trade_offers_received) tradeOffers.trade_offers_received = []
    else for(const o of tradeOffers.trade_offers_received) normalizeCEconTradeOffer(o)
    if(!tradeOffers.trade_offers_sent) tradeOffers.trade_offers_sent = []
    else for(const o of tradeOffers.trade_offers_sent) normalizeCEconTradeOffer(o)
    if(!tradeOffers.descriptions) tradeOffers.descriptions = [] //is it array?
    return tradeOffers
}