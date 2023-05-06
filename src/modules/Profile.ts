import SteamWebModule from "./SteamWebModule";
import {
    GetBadges,
    getBadges, GetCommunityBadgeProgress,
    getCommunityBadgeProgress, GetOwnedGames,
    getOwnedGames, GetRecentlyPlayedGames,
    getRecentlyPlayedGames, GetSteamLevel,
    getSteamLevel, SteamIDParam
} from "../requests/profileRequests";
import {asJsonWithField, ExpectAndRun, statusOk} from "../utils/responseProcessors";
import {
    GetBadgesResponse,
    GetCommunityBadgeProgressResponse,
    GetOwnedGamesResponse,
    GetRecentlyPlayedGamesResponse
} from "../types/profileTypes";

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