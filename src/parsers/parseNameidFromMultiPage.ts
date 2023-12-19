export default (html: string): [nameids: string[], marketHashNames: string[]] => {
    let nameids = html.match(/g_rgItemNameIds *= *(.*?);/)
    let marketHashNames = html.match(/g_rgMarketHashNames *= *(.*);/)
    if(!nameids?.[1] || !marketHashNames?.[1]) {
        const notExistsError = html.match(/The item ".*" does not exist on the market/)
        if(notExistsError) throw new Error(notExistsError[0])
        throw new Error('Malformed response')
    }

    try {
        nameids = JSON.parse(nameids[1])
        marketHashNames = JSON.parse(marketHashNames[1])
    } catch (e) {
        throw new Error('Encountered an error while parsing nameids string:\n' + e.message)
    }

    return [nameids, marketHashNames]
}