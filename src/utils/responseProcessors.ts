import {BadHTTPStatusResponseError} from "steam-session/dist/Errors";

export type ResponseProcessor<T extends any = any> = (res: Response) => T

export const getResponseAndDrain = (res: Response): Response => {
    res.text().then()
    return res
}

export const getSuccessfullText = (res: Response): Promise<String> => {
    if(!res.ok) throw new BadHTTPStatusResponseError(res)
    return res.text()
}