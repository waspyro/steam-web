import SteamSession from "steam-session";
import Inventory from "./modules/Inventory";
import {ProfileUrlParts} from "./types";

type Props = {
    profileUrl: ProfileUrlParts
}

export default class SteamWeb {
    constructor(public readonly session: SteamSession) {}

    inventory = new Inventory(this)

    props: Props = {
        profileUrl: null
    }

    async updateMyProfileURL() {
        const profile = await this.session.me()
        if(!profile) throw new Error('Unable to get profile url')
        return this.props.profileUrl = [profile[2], profile[1], profile[0]]
    }

}