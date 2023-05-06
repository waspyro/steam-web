import {WebApiGetRequestConstructor} from "../utils";
import {
    uApiPlayerGetBadgesV1, uApiPlayerGetCommunityBadgeProgressV1,
    uApiPlayerGetOwnedGamesV1,
    uApiPlayerGetRecentlyPlayedGamesV1,
    uApiPlayerGetSteamLevelV1,
} from "../assets/urls";
import {BoolNum, Numberable} from "../types";

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