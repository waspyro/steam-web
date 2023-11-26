import SteamWebModule from "./SteamWebModule";
import {
    accountDetailsPage,
    accountHelpPage, addFriend,
    editProfileDetails,
    getBadges,
    getCommunityBadgeProgress,
    getGameAvatars,
    getOwnedGames,
    getRecentlyPlayedGames,
    getSteamLevel,
    profilePage,
    profileSettingsPage, querySteamLocations,
    resolveVanityURL,
    selectGameAvatar,
    setLanguage,
} from "../requests/profileRequests";
import {
    asJsonWithField,
    ExpectAndRun,
    getSuccessfullText,
    statusOk
} from "../utils/responseProcessors";
import {
    AccountDetails,
    AccountSupportPageDetails,
    GetBadges,
    GetBadgesResponse,
    GetCommunityBadgeProgress,
    GetCommunityBadgeProgressResponse,
    GetGameAvatarsResponse,
    GetOwnedGames,
    GetOwnedGamesResponse,
    GetRecentlyPlayedGames,
    GetRecentlyPlayedGamesResponse,
    GetSteamLevel,
    GetSteamLevelResponse, ProfileBadges,
    ProfileDetails,
    ProfileDetailsSettings,
    ProfileEditConfig,
    SteamIDParam
} from "../types/profileTypes";
import {MalformedResponse} from "@waspyro/steam-session/dist/constructs/Errors";
import {ErrorWithContext} from "../utils/errors";
import ParseProfileDetails from "../parsers/parseProfileDetails";
import {getSuccessfulJsonFromResponse, getSuccessfulResponseJson} from "@waspyro/steam-session/dist/common/utils";
import {needsProp} from "../utils/decorators";
import {load} from "cheerio";
import xPriceGuessed from "../utils/xPriceGuessed";
import {BoolNum} from "../types";
import {arraySample, defaultify} from "../utils";
import {obj} from "@waspyro/steam-session/dist/common/types";

export default class Profile extends SteamWebModule {

    private WebApiProfileRequest = <REQ extends SteamIDParam, RES extends {response: any}>
    (constructor) => (params?: REQ): Promise<RES['response']> => {
        params = params || {} as REQ
        const webapi = this.web.props.webapi
        if(!webapi) throw new Error('missing "webapi" prop')
        if(!params.steamid) {
            if(!this.web.session.steamid) throw new Error('missing steamid param')
            else params.steamid = this.web.session.steamid
        }
        return this.request(false, constructor, webapi, params)
        (ExpectAndRun(statusOk, asJsonWithField('response')))
    }

    setPrivacy() {}

    getSteamGameAvatars(): Promise<GetGameAvatarsResponse> {
        return this.request(true, getGameAvatars)(getSuccessfulResponseJson)
    }

    setSteamGameAvatar(appid: number, avatarid: number): Promise<true> {
        return this.request(true, selectGameAvatar, this.web.session.sessionid, appid, avatarid)
        (getSuccessfulJsonFromResponse).then(() => true)
    }

    setRandomSteamAvatar() {
        return this.getSteamGameAvatars().then(avatars => { //todo: tries
            const avas = arraySample([...avatars.rgOtherGames, ...avatars.rgOwnedGames, ...avatars.rgRecentGames])
            const appid = avas.appid
            const avatar = arraySample(avas.avatars)
            const avatarid = avatar.ordinal
            return this.setSteamGameAvatar(appid, avatarid)
        })
    }

    @needsProp('profile')
    async editProfileDetails(details: ProfileDetailsSettings, assignDefaults = true): Promise<true> {
        if(assignDefaults) {
            const {profileDetailsDefaults} = await this.getProfileSettings()
            details = defaultify(profileDetailsDefaults, details)
        }
        return this.request(true, editProfileDetails, this.web.props.profileUrl, {
            sessionID: this.web.session.sessionid, ...details
        })(getSuccessfulJsonFromResponse).then(() => true)
    }

    @needsProp('profile')
    getProfileSettings(): Promise<{
        profileEditConfig: ProfileEditConfig,
        badgesDetails: ProfileBadges,
        profileDetailsDefaults: ProfileDetailsSettings
    }> {
        return this.request(true, profileSettingsPage, this.web.props.profileUrl)
        (r => getSuccessfullText(r).then(t => {
            const $ = load(t)
            const configEl = $('#profile_edit_config')
            const profileEditConfig = configEl.data('profile-edit') as ProfileEditConfig
            const badgesDetails = configEl.data('profile-badges') as ProfileBadges
            const profileDetailsDefaults: ProfileDetailsSettings = {
                personaName: profileEditConfig.strPersonaName || '',
                real_name: profileEditConfig.strRealName || '',
                customURL: profileEditConfig.strCustomURL || '',
                country: profileEditConfig.LocationData.locCountryCode || '',
                state: profileEditConfig.LocationData.locStateCode || '',
                city: profileEditConfig.LocationData.locCityCode || '',
                summary: profileEditConfig.strSummary || '',
                hide_profile_awards: profileEditConfig.ProfilePreferences.hide_profile_awards
            }
            return {profileEditConfig, badgesDetails, profileDetailsDefaults}
        }))
    }

    querySteamLocations():
        Promise<{"countrycode":string,"hasstates":BoolNum,"countryname":string}[]>
    querySteamLocations(forCountry: string):
        Promise<{"countrycode":string,"statecode":string,"statename":string}[]>
    querySteamLocations(forCountry: string, forCity: string):
        Promise<{"countrycode":string,"statecode":string,"cityid":number,"cityname":string}[]>
    querySteamLocations(forCountry?: string, forCity?: string) {
        return this.request(true, querySteamLocations, forCountry, forCity)
        (r => getSuccessfulResponseJson(r))
    }

    //todo: come back to simple array based solution and introduce new method such as "assignRandomSteamLocation"
    async getRandomSteamLocation<T extends obj & {country?: string, state?: string}>(
        objectToAssign: T):
        Promise<{country: string, state: string, city: string} & T> {
        if(objectToAssign.city)
            throw new ErrorWithContext('object should not include "city" prop', objectToAssign)
        if(objectToAssign.state && !objectToAssign.country)
            throw new ErrorWithContext('object contains "state", but does not contains "country" prop', objectToAssign)
        defaultify({country: '', state: '', city: ''}, objectToAssign)
        try {
            if(!objectToAssign.country) {
                const country = await this.querySteamLocations()
                    .then(arraySample)
                objectToAssign.country = country.countrycode
                if(!country.hasstates) return objectToAssign as {country: string, state: string, city: string} & T
            }
            if(!objectToAssign.state) {
                const state = await this.querySteamLocations(objectToAssign.country)
                    .then(arraySample)
                objectToAssign.state = state.statecode
            }
            const city = await this.querySteamLocations(objectToAssign.country, objectToAssign.state)
                .then(arraySample)
            objectToAssign.country = city.countrycode
            objectToAssign.state = city.statecode;
            (objectToAssign as any).city = city.cityid;
            return objectToAssign as {country: string, state: string, city: string} & T
        } catch (e) {
            return objectToAssign as {country: string, state: string, city: string} & T
        }
    }

    getProfileDetails(profile: [type: string, id: string, ...rest: any]): Promise<ProfileDetails> {
        return this.request(false, profilePage, profile[0], profile[1])
        (r => getSuccessfullText(r).then(ParseProfileDetails))
    }

    resolveVanityURL(profileid: string) {
        const webapi = this.web.props.webapi
        if(!webapi) throw new Error('missing "webapi" prop')
        return this.request(false, resolveVanityURL, webapi, profileid)
        (ExpectAndRun(statusOk, asJsonWithField('response'), r => {
            if(r.steamid) return r.steamid
            if(r.message) throw new ErrorWithContext('Error: ' + r.message, r)
            else throw new MalformedResponse(r, 'message')
        }))
    }

    getAccountDetails(): Promise<AccountDetails> {
        return this.request(true, accountDetailsPage)(r => getSuccessfullText(r).then(t => {
            const $ = load(t)
            const [balance, currency] = xPriceGuessed($('.accountRow > .price').text())
            const [country, email, emailStatus, SteamGuardStatus] = $('.account_setting_sub_block .account_data_field')
                .toArray().map(e => $(e).text())
            return { balance, currency, country, email, emailStatus, guardStatus: SteamGuardStatus.trim() }
        }))
    }

    getAccountSupportDetails(): Promise<AccountSupportPageDetails> {
        return this.request(true, accountHelpPage)(r => getSuccessfullText(r).then(t => {
            const $ = load(t)
            let needToSpendMoreToActivateAccount = 0
            const needToSpendPopupText = $('.help_event_limiteduser_spend > span').text()
            if(needToSpendPopupText) {
                const matched = needToSpendPopupText.match(/([\d.]+).*?([\d.]+)/)
                needToSpendMoreToActivateAccount = Number(matched[2]) - Number(matched[1])
            }

            let supportMessages = []
            const supportMessagesEls = $('.support_message_ctn').toArray()
            if(supportMessages.length) supportMessages = supportMessagesEls.map(el => $(el).text()
                .replaceAll('\t', '')
                .split('\n')
                .filter(el => el !== ''))

            return {needToSpendMoreToActivateAccount, supportMessages}
        }))
    }

    setLanguage(language = 'english'): Promise<true> {
        return this.request(false, setLanguage, this.web.session.sessionid, language)
        (r => getSuccessfulResponseJson(r).then((r: boolean) => {
            if(!r) throw new Error('failed to set language')
            return true
        }))
    }

    addFriend(steamid: string): Promise<{ "invited": string[], "success": BoolNum }> {
        return this.request(true, addFriend, this.web.session.sessionid, steamid, 0)
        (getSuccessfulJsonFromResponse)
    }

    async updateMyProfileURL() {
        const profile = await this.web.session.me()
        if(!profile) throw new Error('Unable to get profile url')
        return this.web.setProp('profileUrl', [profile[2], profile[1], profile[0]])
    }

    // acceptFriendInvite(steamid) {
    //     return this.request(true, addFriend, this.web.session.sessionid, steamid, 1)
    // }

    // getFriends() { //only scrapping
    //
    // }

    getOwnedGames = this.WebApiProfileRequest<GetOwnedGames, GetOwnedGamesResponse>
    (getOwnedGames)
    getSteamLevel = this.WebApiProfileRequest<GetSteamLevel, GetSteamLevelResponse>
    (getSteamLevel)
    getBadges = this.WebApiProfileRequest<GetBadges, GetBadgesResponse>
    (getBadges)
    getRecentlyPlayedGames = this.WebApiProfileRequest<GetRecentlyPlayedGames, GetRecentlyPlayedGamesResponse>
    (getRecentlyPlayedGames)
    getCommunityBadgeProgress = this.WebApiProfileRequest<GetCommunityBadgeProgress, GetCommunityBadgeProgressResponse>
    (getCommunityBadgeProgress)

}