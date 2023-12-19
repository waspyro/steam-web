//TODO: problem with this is that we don't know if "," or "." used for float values
//by default we just presume that float value is everything that ends ad 2 digits in the end after . of ,
//TODO: if real float separator provided as an argument we should use this as main source of truth
const xPriceGuessed = (str = ''): [
    price: number | null, currency: string | null, priceRaw: string,
    currencyPrefix: string, currencyPostfix: string
] => {
    const digitStr = str.match(/(\d+[.,]?)*/g).join('')
    const digitParts = digitStr.split(/[.,]/)
    let float = 0
    if(digitParts.length > 1)
        float = digitParts[digitParts.length-1].length < 3 ? Number(digitParts.pop()) : 0
    const price = ((Number(digitParts.join('')) * 100 + float) / 100) || null
    const [prefix = '', postfix = ''] = str.split(digitStr)
    const currency = (prefix.trim() + postfix.trim()) || null
    return [price, currency, digitStr, prefix, postfix] //there are probably no cases where prefix and postfix exits in one string, return it as it is anyway
}

export default xPriceGuessed