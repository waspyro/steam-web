import {BadHTTPStatusResponseError} from "steam-session/dist/Errors";
import {BadJSONStatus, ErrorWithContext, UnexpectedHTTPResponseStatus} from "./errors";
import {EMPA} from "./index";

export type ResponseProcessor<T extends any = any> = (res: Response) => T

export const getResponseAndDrain = (res: Response): Response => {
    res.text().then()
    return res
}

export const getSuccessfullText = (res: Response): Promise<string> => {
    if(!res.ok) throw new BadHTTPStatusResponseError(res)
    return res.text()
}

export const asText = (response: Response, cb: (input: string) => any) => response.text().then(cb)
export const asIt = (response: Response, cb: (input: Response) => any) => cb(response)
export const asJson = (response: Response, cb: (input: any) => any) => response.json().then(cb)
export const asJsonWithField = (field: string) => (response: Response, cb: (input: any) => any) =>
    response.json().then(json => {
        if(json[field]) return json[field]
        else throw new ErrorWithContext('response missing field ' + field, json)
    })
export const asJsonWith = (fieldPath: readonly string[] = EMPA, status: readonly any[] = EMPA, andNonEmpty: readonly any[] = EMPA) => {
    return (response: Response, cb: (input: any) => any) => response.json().then(json => {
        let expected = json
        for(const el of fieldPath) expected = expected[el] //todo: throw missing key
        if(status.includes(expected)) {
            let resp = json
            for(const el of andNonEmpty) resp = resp[el] //todo: throw missing key
            if(resp) return cb(resp)
            else throw new ErrorWithContext('malformed json response', json) //todo: malformed json error
        } else {
            throw new BadJSONStatus(json, fieldPath, status, expected)
        }
    })
}

export const successFieldLocation = ['success'] as const
export const successValues = [true, 1] as const
export const statusOk = [200] as const
export const asSuccessJson = asJsonWith(successFieldLocation, successValues)
export const asSuccessJsonWith = asJsonWith.bind(null, successFieldLocation, successValues)

export const ExpectAndRun = (status: readonly number[], processAs, processor = r => r) => {
    return (response: Response) => {
        if (status.includes(response.status)) return processAs(response, processor)
        throw new UnexpectedHTTPResponseStatus(response, status)
    }
}
