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

export type MarketItemPriceHistoryResponse = {
    success: boolean,
    price_prefix: string,
    price_suffix: string,
    prices: [date: string, price: number, volume: string][]
}

export type MarketPriceHistoryResponseNormalized = {
    success: boolean,
    price_prefix: string,
    price_suffix: string,
    prices: [date: Date, price: number, volume: number][]
}

export type Item = {
    appid: string,
    market_hash_name: string
}

export type ItemWithNameid = {
    appid: string,
    market_hash_name: string,
    nameid: string
}

export type MarketItemOrderHistogramResponse = {
    "success": 1 | number,
    "sell_order_table": string,
    "sell_order_summary": string,
    "buy_order_table": string,
    "buy_order_summary": string,
    "highest_buy_order": string,
    "lowest_sell_order": string,
    "buy_order_graph": [price: number, volume: number, description: string]
    "sell_order_graph": [price: number, volume: number, description: string]
    "graph_max_y": number,
    "graph_min_x": number,
    "graph_max_x": number,
    "price_prefix": string,
    "price_suffix": string
}

export type MarketItemOrdersHistogramTable = [price: number, qty: number, from: 'T' | 'G'][]
export type MarketItemOrdersHistogramMinified = {
    table: {
        sell: MarketItemOrdersHistogramTable,
        buy:  MarketItemOrdersHistogramTable
    },
    total: {
        sell: number, buy: number
    },
    currency: string
}