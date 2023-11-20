import {_, defaultify, U, uMake, WebApiGetRequestConstructor} from "../utils";
import {
	uApiPlayerGetBadgesV1,
	uApiPlayerGetCommunityBadgeProgressV1,
	uApiPlayerGetOwnedGamesV1,
	uApiPlayerGetRecentlyPlayedGamesV1,
	uApiPlayerGetSteamLevelV1,
	uApiUserResolveVanityURLV1,
	uCommunity, uCommunityAddFriend,
	uCommunityQueryLocations,
	uHelpEN, uStore,
	uStoreAccount, uStoreCheckoutAddFreeLicense, uStoreDynamicUserData,
} from "../assets/urls";
import {BoolNum, Numberable, RequestConstructorReturns} from "../types";
import {formDataFromObject} from "@waspyro/steam-session/dist/common/utils";
import defaultProfileDetails from "../assets/defaultProfileDetails";
import {
	GetBadges,
	GetCommunityBadgeProgress,
	GetOwnedGames,
	GetRecentlyPlayedGames,
	GetSteamLevel,
	ProfileDetailsSettings,
	ProfileUrlParts
} from "../types/profileTypes";

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
	{autoCookies: false}
] as RequestConstructorReturns

export const profilePage = (type: string, id: string) => [
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

export const profileSettingsPage = (profile: ProfileUrlParts) => [
	uMake(uCommunity, [profile[0], profile[1], 'edit', 'info'])
] as RequestConstructorReturns

export const querySteamLocations = (state?: string, city?: string) => [
	uMake(uCommunityQueryLocations, [state, city].filter(Boolean))
] as RequestConstructorReturns

export const addFreeLicense = (sessionid: string, subid: Numberable) => [
	new URL(uStoreCheckoutAddFreeLicense), {
		method: 'POST',
		body: formDataFromObject({
			action: 'add_to_cart',
			sessionid: sessionid,
			subid: subid.toString()
		})
	}] as RequestConstructorReturns

export const dynamicStoreData = (accountid?: Numberable, accountCountry?: string, v?: number) => [
	uMake(uStoreDynamicUserData, U, {id: accountid, cc: accountCountry, v}), {
	headers: {
		'referer': uStore,
		'X-Requested-With': 'XMLHttpRequest'
	}
}] as RequestConstructorReturns

export const addFriend = (sessionID: string, steamid: string, isAccepting: BoolNum = 0) => [
	new URL(uCommunityAddFriend), {
	method: 'POST',
	body: new URLSearchParams({
		sessionID,
		steamid,
		accept_invite: isAccepting.toString()
	})
}] as RequestConstructorReturns