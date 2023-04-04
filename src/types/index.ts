export type InventoryRequestOpts = {
    steamid: string,
    appid: string | number,
    contextid: string | number,
    count: number,
    language?: string,
    referer?: ProfileUrlParts
    startAssetid?: string,
}

export type WholeInventoryOpts = {
    steamid: string,
    referer?: ProfileUrlParts,
    language?: string,
    count?: number
}

export type OneOfInventory = {steamid?: string, referer?: ProfileUrlParts}

export type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>

export type ProfileUrlParts = [type: 'profiles' | 'id' | string, id: string, full?: string]