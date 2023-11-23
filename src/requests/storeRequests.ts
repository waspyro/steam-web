import {Numberable, RequestConstructorReturns} from "../types";
import {_, uMake} from "../utils";
import {
    uCommunity,
    uStoreAppDetails,
    uStoreBundlePage,
    uStorePackagedetails,
    uStoreRecommendGame,
    uStoreSearch
} from "../assets/urls";
import {ECountry} from "../assets/ECurrency";
import {AppDetailsFilters, StoreGameReviewForm, StoreSearchParams} from "../types/storeTypes";
import {formDataFromObject} from "@waspyro/steam-session/dist/common/utils";
import {ProfileUrlParts} from "../types/profileTypes";

export const appDetails = (appids: Numberable[], cc: ECountry | string, filters?: AppDetailsFilters[]) => [
    uMake(uStoreAppDetails, _, {appids, cc, filters}),
    {autoCookies: false}
] as RequestConstructorReturns

export const packageDetails = (packageid: Numberable, cc: ECountry | string) => [
    uMake(uStorePackagedetails, _, {packageids: packageid, cc}),
    {autoCookies: false}
] as RequestConstructorReturns

export const bundlePage = (bundleid: Numberable) => [
    uMake(uStoreBundlePage, [bundleid]),
    {followRedirects: 0}
] as RequestConstructorReturns

export const storeSearch = (searchParams: StoreSearchParams) => [
    uMake(uStoreSearch, _, searchParams)
] as RequestConstructorReturns

export const recommendGame = (review: StoreGameReviewForm) => [
    new URL(uStoreRecommendGame), {
    body: formDataFromObject(review),
    method: 'POST'
}] as RequestConstructorReturns

export const deleteRecommendation = (appid: Numberable, [type, id]: ProfileUrlParts, sessionid: string) => [
    uMake(uCommunity, [type, id, 'recommended']), {
    body: formDataFromObject({action: 'delete', sessionid, appid}),
    method: 'POST'
}] as RequestConstructorReturns