import SteamWebModule from "./SteamWebModule";
import {
    GetBadges,
    getBadges, GetCommunityBadgeProgress,
    getCommunityBadgeProgress, GetOwnedGames,
    getOwnedGames, GetRecentlyPlayedGames,
    getRecentlyPlayedGames, GetSteamLevel,
    getSteamLevel, resolveVanityURL, SteamIDParam
} from "../requests/profileRequests";
import {asJsonWith, asJsonWithField, ExpectAndRun, statusOk} from "../utils/responseProcessors";
import {
    GetBadgesResponse,
    GetCommunityBadgeProgressResponse,
    GetOwnedGamesResponse,
    GetRecentlyPlayedGamesResponse
} from "../types/profileTypes";
import {MalformedResponse} from "steam-session/dist/constructs/Errors";
import {ErrorWithContext} from "../utils/errors";

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