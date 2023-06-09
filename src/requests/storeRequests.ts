import {Numberable, RequestConstructorReturns} from "../types";
import {_, uMake} from "../utils";
import {uStoreAppDetails, uStoreBundlePage, uStoreCart, uStorePackagedetails, uStoreSearch} from "../assets/urls";
import {ECountry} from "../assets/ECurrency";
import {AppDetailsFilters, StoreSearchParams} from "../types/storeTypes";
import {formDataFromObject} from "steam-session/dist/common/utils";

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