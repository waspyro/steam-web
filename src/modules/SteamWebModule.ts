import SteamWeb from "../SteamWeb";

export default abstract class SteamWebModule {
    protected readonly request: SteamWeb['processRequest']
    constructor(protected web: SteamWeb) {
        this.request = web.processRequest
    }
}