import {Numberable, RequestConstructorReturns} from "../types";
import {_, uMake} from "../utils";
import {uStoreAppDetails, uStoreBundlePage, uStorePackagedetails, uStoreSearch} from "../assets/urls";
import {ECounty} from "../assets/ECurrency";
import {AppDetailsFilters, StoreSearchParams} from "../types/storeTypes";

export const appDetails = (appids: Numberable[], cc: ECounty | string, filters?: AppDetailsFilters[]) => [
    uMake(uStoreAppDetails, _, {appids, cc, filters}),
    {cookiesSet: "manual", cookiesSave: "manual"}
] as RequestConstructorReturns

export const packageDetails = (packageid: Numberable, cc: ECounty | string) => [
    uMake(uStorePackagedetails, _, {packageids: packageid, cc}),
    {cookiesSet: "manual", cookiesSave: "manual"}
] as RequestConstructorReturns

export const bundlePage = (bundleid: Numberable) => [
    uMake(uStoreBundlePage, [bundleid]),
    {followRedirects: 0}
] as RequestConstructorReturns

//todo: store search
export const search = (searchParams: StoreSearchParams) => [
    uMake(uStoreSearch, _, searchParams)
] as RequestConstructorReturns