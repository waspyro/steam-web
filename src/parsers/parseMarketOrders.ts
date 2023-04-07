import {load} from "cheerio";
import xPriceGuessed from "../utils/xPriceGuessed";
import {MarketItemOrderHistogramResponse, MarketItemOrdersHistogramMinified} from "../types/marketTypes";

export const minifyItemOrdersResponse = (
    response: MarketItemOrderHistogramResponse
): MarketItemOrdersHistogramMinified => ({
    currency: response.price_prefix + response.price_suffix,
    total: {sell: parseOrdersQty(response.sell_order_summary), buy: parseOrdersQty(response.buy_order_summary)},
    table: {
        sell: extendTableWithGraph(parseOrdersTable(response.sell_order_table), response.sell_order_graph),
        buy: extendTableWithGraph(parseOrdersTable(response.buy_order_table), response.buy_order_graph)
    }
})

export const parseOrdersTable = html => {
    const $ = load(html)
    const table = []
    $('td').each((i, e) => {
        const el = $(e)
        if(i % 2) table[table.length-1].push(Number(el.text()))
        else table.push([xPriceGuessed(el.text())[0]]) //todo: currency is known, should use it
    })
    return table
}

export const parseOrdersQty = html => {
    const match = html.match(/<span [\w="]*>(\d*)<\/span>*/)
    return match && Number(match[1])
}

export const extendTableWithGraph = (table, graph) => {
    const sort = table[0]?.[0] < table[1]?.[0] ? [1, -1] : [-1, 1]
    const ordersFromGraph = []
    for(const el of table) el[2] = 'T'
    for(let i = graph.length-1; i > 0; i--) {
        let [price, qty] = graph[i]
        qty -= graph[i-1][1]
        ordersFromGraph.push([price, qty, 'G'])
    }

    for(let i = ordersFromGraph.length-1; i >= 0; i--) {
        const tableOrder = table.findIndex(el => el[0] === ordersFromGraph[i][0])
        if(tableOrder === -1)
            table.push(ordersFromGraph[i])
        else if(table[tableOrder][1] !== ordersFromGraph[i][1])
            table[tableOrder][1] = ordersFromGraph[i][1]
    }

    return table.sort((a,b) => a[0] > b[0] ? sort[0] : sort[1])
}

// export const extendTableWithGraphFast = (table, graph) => {
//     const lastItem = table[table.length-1]
//     const ordersFromGraph = []
//     for(const el of table) el[2] = 'T'
//     for(let i = graph.length-1; i > 0; i--) {
//         let [price, qty] = graph[i]
//         qty -= graph[i-1][1]
//         if(price === lastItem[0]) {
//             lastItem[1] = qty
//             lastItem.push('F')
//             break
//         } else {
//             ordersFromGraph.push([price, qty, 'G'])
//         }
//     }
//
//     for(let i = ordersFromGraph.length-1; i >= 0; i--)
//         table.push(ordersFromGraph[i])
//     return table
// }

// export const normalizeItemOrdersResponse = (table, graph, summary) => {
//     for(const el of graph) el.length = 2
//     table = parseOrdersTable(table)
//     extendTableWithGraph(table, graph)
//     return { table, total: parseOrdersQty(summary) }
// }