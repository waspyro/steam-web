import {isDigitString} from "../utils";

export default (html: string): string => {
    const nameids = html.match(/(?<=LoadOrderSpread\(\s*)\d*(?= \))/g) //should be 2
    if(!nameids || nameids.length < 2) throw new Error('cannot find nameid')
    const nameid = nameids[0]
    if(!isDigitString(nameid)) throw new Error('nameid found, but it\'s not seems to be correct: ' + nameid)
    return nameid
}