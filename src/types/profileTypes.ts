import {obj} from "steam-session/dist/common/types";

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