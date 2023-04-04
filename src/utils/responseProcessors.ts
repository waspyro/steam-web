import {BadHTTPStatusResponseError} from "steam-session/dist/Errors";

export type ResponseProcessor = (res: Response) => any

export const getResponseAndDrain = (res: Response) => {
    res.text().then()
    return res
}

export const getSuccessfullText = (res: Response) => {
    if(!res.ok) throw new BadHTTPStatusResponseError(res)
    return res.text()
}