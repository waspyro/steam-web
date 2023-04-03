import {BadHTTPStatusResponseError} from "steam-session/dist/Errors";

export const getSuccessfullText = (res: Response) => {
    if(!res.ok) throw new BadHTTPStatusResponseError(res)
    return res.text()
}