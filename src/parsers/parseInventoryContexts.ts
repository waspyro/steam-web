export default (body: string) => {
    const match = body.match(/g_rgAppContextData\s+=\s+({[\w\W]*}+);/)
    if(!match || !match[1]) {
        //If inventory is empty it's just presented as empty array [], not as object.
        if(body.match(/g_rgAppContextData\s+=\s+\[\s*]\s*;/)) return {}
        return null
    }
    return JSON.parse(match[1])
}