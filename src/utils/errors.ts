
export class ErrorWithContext extends Error {
    constructor(message, public context: any) {super(message)}
}

export class UnexpectedHTTPResponseStatus extends Error {
    constructor(public response: Response, public expected: readonly number[]) {
        super(`Unexpected HTTP response status code: ${response.status} (${response.statusText}).\nExpected: ${expected.join(' ')}`);
    }
}

export class BadJSONStatus extends Error {
    constructor(public json, public expectedField: readonly string[], public expectedValues: readonly any[], public receiveValue: any) {
        super(`Got bad JSON response.`+
        `\nExpected ${expectedField.join('.')} field to be: ${expectedValues.join(' | ')}.`+
        `\nReceived: ${receiveValue}.`)
    }
}
