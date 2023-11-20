import SteamWeb from "../SteamWeb";
import {
  addToCart,
  cartPage,
  finalizeTransaction, getFinalPrice,
  initTransaction,
  rmFormCart,
  startCheckoutProcess
} from "../requests/storeCartRequests";
import parseStoreCart, {StoreCartDetails} from "../parsers/parseStoreCart";
import SteamWebModule from "./SteamWebModule";
import {getSuccessfullText} from "../utils/responseProcessors";
import {Numberable} from "../types";
import {ResponseWithSetCookies} from "@waspyro/steam-session/dist/common/types";
import {drainFetchResponse, getSuccessfulResponseJson} from "@waspyro/steam-session/dist/common/utils";
import {ErrorWithContext} from "../utils/errors";

export default class StoreCart extends SteamWebModule {
  oldState: StoreCartDetails = {}
  state: StoreCartDetails

  constructor(web: SteamWeb, id?: string) {
    super(web)
    this.state = {id, canPurchase: false}
  }

  private parseCartResponse = (response: ResponseWithSetCookies) => getSuccessfullText(response)
    .then(parseStoreCart)
    .then(res => {
      this.oldState = this.state
      this.state = res
      return res
    })

  updateCartDetails() {
    return this.request(true, cartPage, this.state.id)
    (this.parseCartResponse)
  }

  addItemToCart(itemID: Numberable, isBundle: boolean = false) {
    return this.request(true, addToCart, this.web.session.sessionid, this.state.id, String(itemID), isBundle)
    (this.parseCartResponse)
  }

  rmItemFromCart(itemid: string) {
    return this.request(true, rmFormCart, this.web.session.sessionid, this.state.id, itemid)
    (this.parseCartResponse)
  }

  async checkoutWithWallet(): Promise<true> {
    if(!this.state.canPurchase)
      throw new ErrorWithContext('cannot make purchase', this.state)
    if(this.state.totalPrice > this.state.accountBalance)
      throw new ErrorWithContext('not enough balance', this.state)
    await this.#startCheckoutProcess()
    const transid = await this.#initCheckout()
    await this.#getCartFinalPrice(transid)
    return this.#finalizeCartTransaction(transid)
      .finally(() => this.state = {})
  }

  async #startCheckoutProcess() {
    for(let i = 0;; i++) {
      const resp = await this.request(true, startCheckoutProcess, this.state.id)(drainFetchResponse)
      const redirected = resp.headers.get('location') || ''
      if(!redirected.includes('/login/')) break
      if(i > 1) throw new Error('infinite redirect')
      await this.web.session.updateRefreshToken()
    }
    return true
  }

  async #initCheckout() {
    const response = await this.request(true, initTransaction,
      this.web.session.sessionid, this.state.id, this.state.accountCountryCode
    )(getSuccessfulResponseJson)
    if(!response.transid) throw new Error('malformed response, no transid.' + JSON.stringify(response))
    return response.transid
  }

  #getCartFinalPrice(transid: string) {
    return this.request(true, getFinalPrice, this.state.id, transid)(getSuccessfullText)
  }

  async #finalizeCartTransaction(transid: string): Promise<true> {
    const {width, height} = this.web.meta.viewport
    const resp = await this.request(true, finalizeTransaction, this.state.id, transid, height, width)
    (getSuccessfulResponseJson)
    if(Number(resp.success) !== 22)
      throw new Error('steam return bad success status:\n' + JSON.stringify(resp))
    return true
  }

}