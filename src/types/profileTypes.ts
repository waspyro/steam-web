import {obj} from "steam-session/dist/common/types";
import {BoolNum} from "./index";

export type GetOwnedGamesResponse = {
    response: {
        game_count: 2,
        games: {
            appid: number,
            name?: string
            playtime_forver: number,
            img_icon_url?: string,
            has_community_visible_stats?: boolean,
            has_leaderboards?: boolean,
            playtime_windows_forever: number,
            playtime_mac_forever: number,
            playtime_linux_forever: number,
            rtime_last_played: number
        }[]
    }
}

export type GetBadgesResponse = {
    response: {
        badges: {
            badgeid: number,
            level: number,
            completion_time: number,
            xp: number,
            scarcity: number,
            communityitemid?: string,
            border_color?: number,
            appid?: number
        }[],
        player_xp: number,
        player_level: number,
        player_xp_needed_to_level_up: number,
        player_xp_needed_current_level: number
    }
}

export type GetCommunityBadgeProgressResponse = {
    response: { quests: {questid: number, completed: boolean}[] } & obj
}

export type GetSteamLevelResponse = {
    response: { player_level: number }
}

export type GetRecentlyPlayedGamesResponse = {
    response: {
        total_count: 2,
        games?: {
            appid: number,
            name: string,
            playtime_2weeks: number,
            playtime_forever: number,
            img_icon_url: string,
            playtime_windows_forever: number,
            playtime_mac_forever: number,
            playtime_linux_forever: number
        }[]
    }
}


//that's too much to check for
// export type PrivateProfileDetails = {new: true, private: false} | {new: false, private: true}

export type ProfileDetails = {
    new: boolean,
    private: boolean,
    name?: string | null,
    realName?: string | null,
    location?: string | null,
    summary?: string | null,
    topComments?: {authorName: string, authorLink: string, timestamp: string, text: string}[],
    avatarSrc?: string | null,
    status?: 'online' | 'in-game' | 'offline' | string | null
    statusDetails?: string
    //todo
    commentsTotalPages?: number,
    level?: number,
    recentlyPlayedGames?: any[],
    groupsTotal?: number,
    topGroups?: any[],
    gamesTotal?: number,
    screenshotsTotal?: number,
    reviewsTotal?: number,
    showcases?: any[]
}

type AvatarsCollection = {
    appid: number,
    name: string,
    avatar_count: number,
    avatars: {
        ordinal: number,
        avatar_hash: string
    }[]
}

export type GetGameAvatarsResponse = {
    baseAvaLink: string,
    rgRecentGames: AvatarsCollection[],
    rgOwnedGames: AvatarsCollection[],
    rgOtherGames: AvatarsCollection[],
}

export type SelectGameAvatarJSONResponse = {
    success: number,
    message: string
}

export type AccountDetails = {
    balance: null | number,
    currency: string,
    country: string,
    email: string,
    emailStatus: string,
    guardStatus: string
}

export type AccountSupportPageDetails = {
    needToSpendMoreToActivateAccount: number,
    supportMessages: string[]
}