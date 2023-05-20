import SteamWebModule from "./SteamWebModule";
import {
    accountDetailsPage, accountHelpPage,
    editProfileDetails,
    GetBadges,
    getBadges, GetCommunityBadgeProgress,
    getCommunityBadgeProgress, getGameAvatars, GetOwnedGames,
    getOwnedGames, GetRecentlyPlayedGames,
    getRecentlyPlayedGames, GetSteamLevel,
    getSteamLevel, ProfileDetailsSettings, profilePage, resolveVanityURL, selectGameAvatar, SteamIDParam
} from "../requests/profileRequests";
import {
    asJsonWithField,
    ExpectAndRun,
    getSuccessfullText,
    statusOk
} from "../utils/responseProcessors";
import {
    AccountDetails, AccountSupportPageDetails,
    GetBadgesResponse,
    GetCommunityBadgeProgressResponse, GetGameAvatarsResponse,
    GetOwnedGamesResponse,
    GetRecentlyPlayedGamesResponse, ProfileDetails
} from "../types/profileTypes";
import {MalformedResponse} from "steam-session/dist/constructs/Errors";
import {ErrorWithContext} from "../utils/errors";
import ParseProfileDetails from "../parsers/parseProfileDetails";
import {getSuccessfulResponseJson} from "steam-session/dist/common/utils";
import {needsProp} from "../utils/decorators";
import {load} from "cheerio";
import xPriceGuessed from "../utils/xPriceGuessed";

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

    getGameAvatars(): Promise<GetGameAvatarsResponse> {
        return this.request(true, getGameAvatars)(getSuccessfulResponseJson)
    }

    selectGameAvatar(appid: number, avatarid: number): Promise<true> {
        return this.request(true, selectGameAvatar, this.web.session.sessionid, appid, avatarid)
        (r => getSuccessfulResponseJson(r).then(r => {
            if(r.success !== 1) throw new ErrorWithContext('something went wrong', r)
            return true
        }))
    }

    @needsProp('profile')
    editProfileDetails(details: ProfileDetailsSettings): Promise<true> {
        return this.request(true, editProfileDetails, this.web.props.profileUrl, {
            sessionID: this.web.session.sessionid, ...details
        })(r => getSuccessfulResponseJson(r).then(r => {
            if(r.success !== 1) throw new ErrorWithContext('something wen wrong', r)
            return true
        }))
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

    async getAccountDetails(): Promise<AccountDetails> {
        return this.request(true, accountDetailsPage)(r => getSuccessfullText(r).then(t => {
            const $ = load(t)
            const [balance, currency] = xPriceGuessed($('.accountRow > .price').text())
            const [country, email, emailStatus, SteamGuardStatus] = $('.account_setting_sub_block .account_data_field')
                .toArray().map(e => $(e).text())
            return { balance, currency, country, email, emailStatus, guardStatus: SteamGuardStatus.trim() }
        }))
    }

    async getAccountSupportDetails(): Promise<AccountSupportPageDetails> {
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

    getOwnedGames = this.WebApiProfileRequest<GetOwnedGames, GetOwnedGamesResponse>
    (getOwnedGames)
    getSteamLevel = this.WebApiProfileRequest<GetSteamLevel, GetOwnedGamesResponse>
    (getSteamLevel)
    getBadges = this.WebApiProfileRequest<GetBadges, GetBadgesResponse>
    (getBadges)
    getRecentlyPlayedGames = this.WebApiProfileRequest<GetRecentlyPlayedGames, GetRecentlyPlayedGamesResponse>
    (getRecentlyPlayedGames)
    getCommunityBadgeProgress = this.WebApiProfileRequest<GetCommunityBadgeProgress, GetCommunityBadgeProgressResponse>
    (getCommunityBadgeProgress)

}