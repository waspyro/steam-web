import {Numberable} from "../types";

export default (html: string, id: Numberable): BundleDetailsParsed => {
    const details = JSON.parse(html.match(/data-ds-bundle-data="(.*?)" /)[1].replaceAll('&quot;', '"'))
    const discount = details.m_nDiscountPct
    const mustPurchaseAsSet = details.m_bMustPurchaseAsSet
    const isCommercial = details.m_bIsCommercial
    const isGiftsRestricted = details.m_bRestrictGifting
    const items = details.m_rgItems.map(el => Object({
        subid: el.m_nPackageID,
        appids: el.m_rgIncludedAppIDs,
        isDiscounted: el.m_bPackageDiscounted,
        basePrice: el.m_nBasePriceInCents / 100,
        finalPrice: el.m_nBasePriceInCents / 100,
        finalPriceWithBundleDiscount: el.m_nFinalPriceWithBundleDiscount / 100
    }))

    return {
        id: id.toString(), discount,
        mustPurchaseAsSet, isCommercial,
        isGiftsRestricted, items
    }
}

export type BundleDetailsParsed = {
    id: string,
    discount: string,
    mustPurchaseAsSet: number,
    isCommercial: boolean,
    isGiftsRestricted: boolean,
    items: {
        subid: number,
        appids: number[],
        isDiscounted: boolean,
        basePrice: number,
        finalPrice: number,
        finalPriceWithBundleDiscount: number
    }[]
}