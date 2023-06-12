import SteamSession from "steam-session";
import {RequestOpts} from "steam-session/dist/common/types";

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

export type RequestConstructor = (...args: any[]) => readonly [URL, RequestOpts?]

export type RequestConstructorReturns = readonly [URL, RequestOpts?]

export type Numberable = string | number

export type BoolNum = 1 | 0

export type SessionHTTPResponse = Awaited<ReturnType<SteamSession['request']>>

export type SteamWebConstructorParams = {
    forceAuthorized?: boolean,
    meta?: {
        viewport: {
            width: number,
            height: number
        }
    }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
    : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
      : Partial<T>;