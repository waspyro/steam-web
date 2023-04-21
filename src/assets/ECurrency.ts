//https://partner.steamgames.com/doc/store/pricing/currencies
export const ECurrency = {
    USD: 1,
    GBP: 2,
    EUR: 3,
    CHF: 4,
    RUB: 5,
    PLN: 6,
    BRL: 7,
    JPY: 8,
    NOK: 9,
    IDR: 10,
    MYR: 11,
    PHP: 12,
    SGD: 13,
    THB: 14,
    VND: 15,
    KRW: 16,
    TRY: 17,
    UAH: 18,
    MXN: 19,
    CAD: 20,
    AUD: 21,
    NZD: 22,
    CNY: 23,
    INR: 24,
    CLP: 25,
    PEN: 26,
    COP: 27,
    ZAR: 28,
    HKD: 29,
    TWD: 30,
    SAR: 31,
    AED: 32,
    SEK: 33,
    ARS: 34,
    ILS: 35,
    BYN: 36,
    KZT: 37,
    KWD: 38,
    QAR: 39,
    CRC: 40,
    UYU: 41,
    BGN: 42,
    HRK: 43,
    CZK: 44,
    DKK: 45,
    HUF: 46,
    RON: 47,
} as const

export type ECurrencyKeys = keyof typeof ECurrency
export type ECurrencyValues = typeof ECurrency[ECurrencyKeys]

//cut from ECurrency, maybe it is possible extract it with some
//generic type but i don't know how
export type ECounty =
"US"|  "GB"|  "EU"|  "CH"|  "RU"|
"PL"|  "BR"|  "JP"|  "NO"|  "ID"|
"MY"|  "PH"|  "SG"|  "TH"|  "VN"|
"KR"|  "TR"|  "UA"|  "MX"|  "CA"|
"AU"|  "NZ"|  "CN"|  "IN"|  "CL"|
"PE"|  "CO"|  "ZA"|  "HK"|  "TW"|
"SA"|  "AE"|  "SE"|  "AR"|  "IL"|
"BY"|  "KZ"|  "KW"|  "QA"|  "CR"|
"UY"|  "BG"|  "HR"|  "CZ"|  "DK"|
"HU"|  "RO"| string