export default (html: string): WebApiKeyParserReturn => {
    const key = html.match(/<p>Key: (\w*)<\/p>/)?.[1]
    if(!key) {
        const status = html.match('Register for a new Steam Web API Key')
            ? 'canRegister' : 'cannotRegister'
        return {status, key: null, domain: null}
    }
    const domain = html.match(/<p>Domain Name:\s*([\w\W]*)<\/p>/)[1]
    return {status: 'exists', key, domain}
}

type WebApiKeyParserReturn =
    {status: 'canRegister' | 'cannotRegister', key: null, domain: null} |
    {status: 'exists', key: string, domain: string}