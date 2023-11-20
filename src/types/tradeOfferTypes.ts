import {obj} from "@waspyro/steam-session/dist/common/types";

export type AcceptTradeOfferResponse = {
    tradeid: string
}

export type SendTradeOfferResponse = {
    "tradeofferid": string,
    "needs_mobile_confirmation": boolean,
    "needs_email_confirmation": boolean,
    "email_domain": string
}

//ETradeOfferState
const ETradeOfferState = {
    'invalid': 1,
    'active': 2,
    'accepted':	3,
    'countered': 4,
    'expired':	5,
    'canceled':	6,
    'declined':	7,
    'invalidItems':	8,
    'createdNeedsConfirmation':	9,
    'canceledBySecondFactor': 10,
    'inEscrow':	11,
} as const
export type ETradeOfferStateKeys = keyof typeof ETradeOfferState
export type ETradeOfferStateValues = typeof ETradeOfferState[ETradeOfferStateKeys]

// CEcon_Asset
export type CEconAsset = {
    appid: number
    contextid: string
    assetid: string
    currencyid?: any
    classid: string
    instanceid: string
    amount: string
    missing: boolean
    est_usd: string
}

//https://developer.valvesoftware.com/wiki/Steam_Web_API/IEconService#CEcon_TradeOffer
export type CEconTradeOffer = {
    tradeofferid: string
    accountid_other: number
    message: string
    expiration_time: number
    trade_offer_state: ETradeOfferStateValues
    items_to_give: CEconAsset[]
    items_to_receive: CEconAsset[]
    is_our_offer: boolean
    time_created: number // * 100
    time_updated: number // * 100
    from_real_time_trade: boolean
    escrow_end_date: number
    confirmation_method: 0 | 1 | 2 | number
    eresult: number //not doc
}

export type GetTradeOffersResponse = {
    response: {
        trade_offers_received: CEconTradeOffer[]
        trade_offers_sent: CEconTradeOffer[],
        next_cursor: number
        descriptions: any
    }
}

export type GetTradeOffersSummaryResponse = {
    pending_received_count: number,
    new_received_count: number,
    updated_received_count: number,
    historical_received_count: number,
    pending_sent_count: number,
    newly_accepted_sent_count: number,
    updated_sent_count: number,
    historical_sent_count: number,
    escrow_received_count: number,
    escrow_sent_count: number
}

export type TradeofferAssetRawMinimal = {
    appid: number | string, contextid: string | number,
    amount: number | string, assetid: string | number
} & obj

export type TradeofferAsset = {
    appid: number, contextid: string,
    amount: number, assetid: string
}