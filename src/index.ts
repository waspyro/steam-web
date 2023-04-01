import SteamSession from "steam-session";

export default class SteamWeb {
    constructor(public readonly session: SteamSession) {}
}