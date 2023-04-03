import SteamSession from "steam-session";
import Inventory from "./modules/Inventory";

type Props = {
    profileUrl: [full: string, id: string, type: 'profiles' | 'id']
}

export default class SteamWeb {
    constructor(public readonly session: SteamSession) {}

    inventory = new Inventory(this)

    props: Props = {
        profileUrl: null
    }

    async updateMyProfileURL() {
        this.props.profileUrl = await this.session.me()
        return this.props.profileUrl
    }

    catcher(error, func, args) {}

}