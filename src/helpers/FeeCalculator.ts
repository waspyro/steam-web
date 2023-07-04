const DEFAULT_STEAM_FEE = 0.05
const DEFAULT_APP_FEE = 0.10

export const FeeCalculator = (appFee = DEFAULT_APP_FEE, steamFee = DEFAULT_STEAM_FEE) => {
  const toSeller = (priceWithCents: number) => // 10_00 => 11_50
    priceWithCents + (Math.floor(priceWithCents * steamFee) || 1) +
                     (Math.floor(priceWithCents * appFee)   || 1)

  const toBuyer = (priceWithCents: number) => { // 11_50 => 10_00; 10_00 => 8_70
    let start = Math.floor(priceWithCents / (1 + steamFee + appFee))
    if(start < 8) return start - 1 > 0 ? start - 1 : 1
    while (++start < priceWithCents) {
      const candidate = toSeller(start)
      if(priceWithCents === candidate) return start
      else if (priceWithCents < candidate) return start - 1
    }
  }

  return {toSeller, toBuyer}
  //i don't know how to name this accordingly (with/withoutFee, toUpper/Lover seems bad)

}
