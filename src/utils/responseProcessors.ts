import {BadJSONStatus, ErrorWithContext, UnexpectedHTTPResponseStatus} from "./errors";
import {EMPA} from "./index";
import {BadHTTPStatusResponseError} from "steam-session/dist/constructs/Errors";
import {SessionHTTPResponse} from "../types";

export type ResponseProcessor<T extends any = any> = (res: SessionHTTPResponse) => T

export const getResponseAndDrain = (res: SessionHTTPResponse): SessionHTTPResponse => {
    res.text().then()
    return res
}

export const getSuccessfullText = (res: SessionHTTPResponse): Promise<string> => {
    if(!res.ok) throw new BadHTTPStatusResponseError(res)
    return res.text()
}

export const asText = (response: SessionHTTPResponse, cb: (input: string) => any) => response.text().then(cb)
export const asIt = (response: SessionHTTPResponse, cb: (input: SessionHTTPResponse) => any) => cb(response)
export const asJson = (response: SessionHTTPResponse, cb: (input: any) => any) => response.json().then(cb)
export const asJsonWithField = (field: string) => (response: SessionHTTPResponse, cb: (input: any) => any = v => v) =>
    response.json().then(json => {
        if(json[field]) return cb(json[field])
        else throw new ErrorWithContext('response missing field ' + field, json)
    })
export const asJsonWith = (fieldPath: readonly string[] = EMPA, status: readonly any[] = EMPA, andNonEmpty: readonly any[] = EMPA) => {
    return (response: SessionHTTPResponse, cb: (input: any) => any) => response.json().then(json => {
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
    return (response: SessionHTTPResponse) => {
        if (status.includes(response.status)) return processAs(response, processor)
        throw new UnexpectedHTTPResponseStatus(response, status)
    }
}
