import {ECounty, ECurrencyValues} from "../assets/ECurrency";
import {BoolNum, Numberable} from "../types";

export type RGWalletInfo = {
    currency: ECurrencyValues,
    county: ECounty,
    state: string,
    fee: '1' | Numberable,
    fee_minimum: '1' | Numberable,
    fee_percent: '0.05' | Numberable,
    publisher_fee_percent_default: '0.10' | Numberable,
    fee_base: '0' | Numberable,
    balance: Numberable,
    delayed_balance: Numberable,
    max_balance: Numberable,
    trade_max_balance: Numberable,
    success: BoolNum,
    rwgrsn: -2 | number
}
export const checkWalletStatus = (html: string): RGWalletInfo => {
    const match = html.match(/var g_rgWalletInfo =(.*);/)
    if(!match) return null
    const wallet = JSON.parse(match[1].replaceAll('wallet_', ''))
    if(!wallet.success) return null
    return wallet
}

export type MarketRestrictions = [restricted: false | 'noPurchases' | 'temporary' | 'unknown', ends?: Date]
export const marketRestrictions = (html: string): MarketRestrictions  => {
    const match = html.match(/The Market is unavailable for the following reason\(s\)/)
    if(!match) return [false]
    if(html.match('You must have a valid Steam purchase')) return ['noPurchases']
    const whenLimitsEnds = html.match(/<span id="market_timecanuse">([\w\W]*?)<\/span>/)
    if(whenLimitsEnds) return ['temporary', new Date(whenLimitsEnds[1])]
    return ['unknown']
}

export type MarketStatus = {wallet: RGWalletInfo, restrictions: MarketRestrictions}
export default (html: string): MarketStatus => ({
    wallet: checkWalletStatus(html),
    restrictions: marketRestrictions(html)
})