import {load} from "cheerio";
import {ProfileDetails} from "../types/profileTypes";

export default (html: string): ProfileDetails => {
    const $ = load(html)
    const profileDetails: ProfileDetails = {new: false, private: false}
    profileDetails.avatarSrc = $('div.playerAvatar > div > img')?.attr('src') || null
    if($('.welcome_header').length) {
        profileDetails.new = true
        return profileDetails
    }
    const classesString = $('.profile_in_game.persona').attr('class') || ''
    profileDetails.status = classesString.replace('profile_in_game persona', '').trim()
    profileDetails.statusDetails = $('.profile_in_game_name').text().trim()
    const privateInfo = $('.profile_private_info')
    if(privateInfo.length) {
        const text = privateInfo.text()
        if(text.includes('is private')) profileDetails.private = true
        else profileDetails.new = true
        return profileDetails
    }
    profileDetails.name = $('.actual_persona_name').text().trim() || null
    const nameAndLocation = $('.header_real_name').text().trim().split('\n').map(e => e.trim()).filter(Boolean)
    profileDetails.realName = nameAndLocation[0] ?? null
    profileDetails.location = nameAndLocation[1] ?? null
    profileDetails.summary = $('.profile_summary').text().trim() || null
    profileDetails.topComments = $('.commentthread_comment_content').map((i, el) => {
        const $ = load(el)
        const author = $('.commentthread_author_link')
        const authorName = author.text().trim()
        const authorLink = author.attr('href')
        const timestamp = $('.commentthread_comment_timestamp').attr('data-timestamp')
        const text = $('.commentthread_comment_text').text().trim()
        return {authorName, authorLink, timestamp, text}
    }).toArray()
    //todo: comment pages total, etc...
    return profileDetails as ProfileDetails
}
