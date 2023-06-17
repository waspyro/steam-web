import {DynamicStoreTypes} from "../types/storeTypes";

export default (json) => {
	const normalized = {}
	for(let key in json) {
		let fixedKey
		for (const type of ['rg', 'b', 'n']) {
			if(!key.startsWith(type)) continue
			fixedKey = key.replace(type, '')
			fixedKey = fixedKey.charAt(0).toLowerCase() + fixedKey.slice(1)
		}
		normalized[fixedKey] = json[key]
	}
	return normalized as DynamicStoreTypes
}