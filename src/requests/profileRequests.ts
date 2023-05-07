import {_, uMake, WebApiGetRequestConstructor} from "../utils";
import {
    uApiPlayerGetBadgesV1, uApiPlayerGetCommunityBadgeProgressV1,
    uApiPlayerGetOwnedGamesV1,
    uApiPlayerGetRecentlyPlayedGamesV1,
    uApiPlayerGetSteamLevelV1, uApiUserResolveVanityURLV1,
} from "../assets/urls";
import {BoolNum, Numberable, RequestConstructorReturns} from "../types";

export type ResolveVanityURLRequest = {vanityurl: string}
export type SteamIDParam = { steamid?: string } //todo: required but partial for constructor
export type GetRecentlyPlayedGames = SteamIDParam & { count?: Numberable }
export type GetCommunityBadgeProgress = SteamIDParam & { badgeid: number }
export type GetSteamLevel = SteamIDParam
export type GetBadges = SteamIDParam
export type GetOwnedGames = SteamIDParam & {
    include_appinfo?: BoolNum,
    include_played_free_games?: BoolNum,
    appids_filter?: number[]
}

export const getBadges =
    WebApiGetRequestConstructor<GetBadges>(uApiPlayerGetBadgesV1)
export const getCommunityBadgeProgress =
    WebApiGetRequestConstructor<GetCommunityBadgeProgress>(uApiPlayerGetCommunityBadgeProgressV1)
export const getRecentlyPlayedGames =
    WebApiGetRequestConstructor<GetRecentlyPlayedGames>(uApiPlayerGetRecentlyPlayedGamesV1)
export const getOwnedGames =
    WebApiGetRequestConstructor<GetOwnedGames>(uApiPlayerGetOwnedGamesV1)
export const getSteamLevel =
    WebApiGetRequestConstructor<GetSteamLevel>(uApiPlayerGetSteamLevelV1)
export const resolveVanityURL = (webapi: string, vanityurl: string) => [
    uMake(uApiUserResolveVanityURLV1, _, {key: webapi, vanityurl}),
    {cookiesSet: 'manual', cookiesSave: 'manual'}
] as RequestConstructorReturns