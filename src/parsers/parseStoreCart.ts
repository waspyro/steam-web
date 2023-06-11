import {load} from "cheerio";
import xPriceGuessed from "../utils/xPriceGuessed";

export type StoreCartDetails = {
  id?: string | undefined,
  items?: {
    id: string,
    name: string,
    subid: null | string,
    appids: string[],
    url: string,
    notes: string[],
    includes: null | string,
    price: {original: number, current: number}
  }[],
  duplicates?: {name: string}[], //??
  totalPrice?: number,
  accountBalance?: null | number,
  accountCurrency?: string,
  accountCountryCode?: string,
  canGift?: boolean,
  canPurchase?: boolean
}

export default (html: string): StoreCartDetails => {
  if (!html) return {}
  const $ = load(html)

  const cartItemsEls = $('.cart_item_list > div').toArray()
  const items = cartItemsEls.map((elx) => {
    const el = $(elx)
    const subid = el.attr('data-ds-packageid') || null
    const appids = el.attr('data-ds-appid')?.split(',') || null
    const id = el.attr('id')?.split('cart_row_')?.[1] || null
    let [original, current] = el.find('.cart_item_price > .price')
      .toArray().map(el => xPriceGuessed($(el).text())[0])
    if (!current) current = original
    const refEl = el.find('.cart_item_desc > a')
    const name = refEl.text().trim()
    const url = refEl.attr('href')
    const notes = el.find('.cart_item_desc_ext').text().split('\n').filter(e => e)
    const includes = el.find('.package_contents').text().replace(/[\t]*/g, '') || null
    return {id, name, subid, appids, url, notes, includes, price: {original, current}}
  })

  const [totalPrice, accountCurrency] = xPriceGuessed($('#cart_estimated_total').text().trim())
  const [accountBalance] = xPriceGuessed($('#header_wallet_balance').text().trim())
  const accountCountryCode = $('#usercountrycurrency').attr('value') || null

  const buttons = $('.cart_checkout_buttons > .continue').toArray()
  let canGift = null, canPurchase = null
  for (const el of buttons) {
    const status = !$(el).hasClass('btn_disabled')
    if ($(el).text().includes('gift')) canGift = status
    else canPurchase = status
  }

  const pattern = /rgDuplicateItems.push\( "([\w\W]*?)" \)/g
  const duplicates = []

  let match

  while (match = pattern.exec(html)) {
    const possibleMatch = items.find(el => el.name.toLowerCase() === match[1].toLowerCase())
    duplicates.push(possibleMatch || {name: match[1]})
  }

  let id = $('input[name="cart"]').attr('value')
  if(id === '-1') id = undefined

  return {
    id, items, duplicates, totalPrice,
    accountBalance, accountCurrency, accountCountryCode,
    canGift, canPurchase
  }

}
