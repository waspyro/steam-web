import {
  uCartCheckoutFinalizeTransaction,
  uCartCheckoutGetFinalPrice,
  uCartCheckoutInitTransaction,
  uStore,
  uStoreCart,
  uStoreCheckout
} from "../assets/urls";
import {RequestConstructorReturns} from "../types";
import {_, uMake} from "../utils";
import {formDataFromObject} from "steam-session/dist/common/utils";

type CartID = string | undefined | '' | null

export const cartPage = (shoppingCartGID: CartID) => [
  new URL(uStoreCart), {
    appendCookies: {shoppingCartGID}
  }] as RequestConstructorReturns

const rejectSetCookies = ['shoppingCartGID', 'beginCheckoutCart']

export const addToCart = (sessionid: string, shoppingCartGID: CartID, itemid: string, isBundle: boolean) => [
  new URL(uStoreCart), {
    method: 'POST',
    body: formDataFromObject({
        action: 'add_to_cart',
        sessionid,
        [isBundle ? 'bundleid': 'subid']: itemid
    }),
    appendCookies: {shoppingCartGID},
    rejectSetCookies,
    followRedirects: 2
}] as RequestConstructorReturns

export const rmFormCart = (sessionid, shoppingCartGID: CartID, cartItemID) => [
  new URL(uStoreCart), {
  method: 'POST',
  body: formDataFromObject({
    action: 'remove_line_item',
    cart: shoppingCartGID,
    sessionid,
    lineitem_gid: cartItemID
  }),
  appendCookies: {shoppingCartGID},
  rejectSetCookies
}] as RequestConstructorReturns

export const startCheckoutProcess = (shoppingCartGID: CartID) => [
  uMake(uStoreCheckout, _, {purchasetype: 'self'}), {
  appendCookies: {shoppingCartGID},
  rejectSetCookies,
  followRedirects: 0,
}] as RequestConstructorReturns

export const getFinalPrice = (shoppingCartGID, transid) => [
  uMake(uCartCheckoutGetFinalPrice,_, {
    count: 1,
    transid,
    cart: shoppingCartGID,
    purchasetype: 'self',
    microtxnid: '-1',
    gidReplayOfTransID: '-1'
  }), {
    appendCookies: {shoppingCartGID, beginCheckoutCart: shoppingCartGID},
    rejectSetCookies
  }
] as RequestConstructorReturns

export const initTransaction = (sessionid, shoppingCartGID, countryCode) => [
  new URL(uCartCheckoutInitTransaction), {
    method: 'POST',
    headers: {
      Origin: uStore,
      Referer: uMake(uStoreCheckout, _, {purchasetype: 'self', cart: shoppingCartGID}).toString()
    },
    appendCookies: {shoppingCartGID, beginCheckoutCart: shoppingCartGID},
    rejectSetCookies,
    body: formDataFromObject({
          "bUseRemainingSteamAccount": "1",
          "PaymentMethod": "steamaccount",
          "sessionid": sessionid,
          "gidShoppingCart": shoppingCartGID,
          "Country": countryCode,
          "ShippingCountry": countryCode,
          "gidPaymentID": "",
          "gidReplayOfTransID": "-1",
          "abortPendingTransactions": "0",
          "bHasCardInfo": "0",
          "CardNumber": "",
          "CardExpirationYear": "",
          "CardExpirationMonth": "",
          "FirstName": "",
          "LastName": "",
          "Address": "",
          "AddressTwo": "",
          "City": "",
          "State": "",
          "PostalCode": "",
          "Phone": "",
          "ShippingFirstName": "",
          "ShippingLastName": "",
          "ShippingAddress": "",
          "ShippingAddressTwo": "",
          "ShippingCity": "",
          "ShippingState": "",
          "ShippingPostalCode": "",
          "ShippingPhone": "",
          "bIsGift": "0",
          "GifteeAccountID": "0",
          "GifteeEmail": "",
          "GifteeName": "",
          "GiftMessage": "",
          "Sentiment": "",
          "Signature": "",
          "ScheduledSendOnDate": "0",
          "BankAccount": "",
          "BankCode": "",
          "BankIBAN": "",
          "BankBIC": "",
          "TPBankID": "",
          "bSaveBillingAddress": "1",
          "bPreAuthOnly": "0",
    })
}] as RequestConstructorReturns

export const finalizeTransaction = (
  shoppingCartGID: string, transid: string,
  screenHeight: number, screenWidth: number
) => [
  new URL(uCartCheckoutFinalizeTransaction), {
    headers: {
      Origin: uStore,
      Referer: uMake(uStoreCheckout, _, {purchasetype: 'self', cart: shoppingCartGID}).toString()
    },
    method: 'POST',
    appendCookies: {shoppingCartGID, beginCheckoutCart: shoppingCartGID},
    rejectSetCookies,
    body: formDataFromObject({
      transid,
      cardCVV2: '',
      browserInfo: JSON.stringify({
        'language': 'en-GB',
        'javaEnabled': 'false',
        'colorDepth': 30,
        'screenHeight': screenHeight,
        'screenWidth': screenWidth
      })
    })
  }
] as RequestConstructorReturns
