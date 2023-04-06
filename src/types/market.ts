
export type MarketItemPriceOverviewResponse = {
    success: boolean,
    lowest_price?: string,
    volume?: string,
    median_price?: string
}

export type MarketItemPriceOverviewParsed = {
    price: {lowest: number | null, median: number | null}
    currency: string | null, volume: number | null
}