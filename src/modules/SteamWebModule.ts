import SteamWeb from "../index";

export default abstract class SteamWebModule {
    protected readonly request: SteamWeb['processRequest']
    constructor(private web: SteamWeb) {
        this.request = web.processRequest
    }
}