export type InventoryRequestOpts = {
    steamid: string,
    startAssetid?: string,
    appid: string | number,
    contextid: string | number,
    language?: string,
    count: number,
    referer?: string
}

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>