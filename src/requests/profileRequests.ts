import {_, defaultify, U, uMake, WebApiGetRequestConstructor} from "../utils";
import {
    uApiPlayerGetBadgesV1, uApiPlayerGetCommunityBadgeProgressV1,
    uApiPlayerGetOwnedGamesV1,
    uApiPlayerGetRecentlyPlayedGamesV1,
    uApiPlayerGetSteamLevelV1, uApiUserResolveVanityURLV1, uCommunity, uHelpEN, uStore, uStoreAccount,
} from "../assets/urls";
import {BoolNum, Numberable, ProfileUrlParts, RequestConstructorReturns} from "../types";
import {formDataFromObject} from "steam-session/dist/common/utils";
import defaultProfileDetails from "../assets/defaultProfileDetails";

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

export type ProfileDetailsSettings = Partial<{
    personaName: string, real_name: string,
    customURL: string, country: string, state: string,
    city: number | string, summary: string, hide_profile_awards: BoolNum
}>

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

export const profilePage = (type, id) => [
    uMake(uCommunity, [type, id])
] as RequestConstructorReturns

export const getGameAvatars = () => [
    uMake(uCommunity, ['actions', 'GameAvatars'], {json: 1, l: 'english'})
] as RequestConstructorReturns

export const selectGameAvatar = (sessionid: string, appid: number, selectedAvatar: number) => [
    uMake(uCommunity, ['ogg', appid, 'selectAvatar']), {
    method: 'POST',
    body: formDataFromObject({sessionid, json: '1', selectedAvatar: selectedAvatar.toString()})
}] as RequestConstructorReturns

export const editProfileDetails = (profile: ProfileUrlParts, details: ProfileDetailsSettings & {sessionID: string}) => [
    uMake(uCommunity, [profile[0], profile[1], 'edit/']), {
    method: 'POST',
    body: formDataFromObject(defaultify(defaultProfileDetails, details))
}] as RequestConstructorReturns

export const accountDetailsPage = () => [
    new URL(uStoreAccount)
] as RequestConstructorReturns

export const accountHelpPage = () => [
    new URL(uHelpEN)
] as RequestConstructorReturns

export const setLanguage = (sessionid: string, language: string) => [
    uMake(uStoreAccount, ['setlanguage']), {
    method: 'POST',
    body: formDataFromObject({language, sessionid})
}] as RequestConstructorReturns