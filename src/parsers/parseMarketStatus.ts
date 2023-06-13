import {ECountry, ECurrencyValues} from "../assets/ECurrency";
import {BoolNum, Numberable} from "../types";

export type RGWalletInfo<NUMBER_AS=BoolNum> = {
	currency: ECurrencyValues,
	country: ECountry,
	state: string,
	fee: '1' | NUMBER_AS,
	fee_minimum: '1' | NUMBER_AS,
	fee_percent: '0.05' | NUMBER_AS,
	publisher_fee_percent_default: '0.10' | NUMBER_AS,
	fee_base: '0' | NUMBER_AS,
	balance: NUMBER_AS,
	delayed_balance: NUMBER_AS,
	max_balance: NUMBER_AS,
	trade_max_balance: NUMBER_AS,
	success: BoolNum,
	rwgrsn: -2 | number
}

const numberalbleFields = [
	'fee', 'fee_minimum', 'fee_percent', 'publisher_fee_percent_default',
	'fee_base', 'balance', 'delayed_balance', 'max_balance', 'trade_max_balance'
]

export const checkWalletStatus = (html: string): RGWalletInfo<number> => {
	const match = html.match(/var g_rgWalletInfo =(.*);/)
	if(!match) return null
	const wallet = JSON.parse(match[1].replaceAll('wallet_', '')) as RGWalletInfo<BoolNum>
	if(!wallet.success) return null
	for(const field of numberalbleFields)
		wallet[field] = wallet[field] && Number(wallet[field])
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

export type MarketStatus = {wallet: RGWalletInfo<number>, restrictions: MarketRestrictions}
export default (html: string): MarketStatus => ({
	wallet: checkWalletStatus(html),
	restrictions: marketRestrictions(html)
})