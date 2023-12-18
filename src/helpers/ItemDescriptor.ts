//experimental
import {Asset, DescriptionsCommon} from "../types/inventoryTypes";

export class ItemInstance {
  container = null
  constructor(public id: string, public description: DescriptionsCommon & object) {}
}

export class ItemContainer {
  instances = {}
  id: string
  item: object

  constructor(id: string, instance: ItemInstance) {
    this.id = id
    this.item = {
      appid: instance.description.appid,
      market_hash_name:  instance.description.market_hash_name,
      contextid: instance.description.contextid || instance.description.unowned_contextid,
      nameid: null
    }
    this.addInstance(instance)
  }

  addInstance(instance: ItemInstance) {
    this.instances[instance.id] = instance
  }

}

export default class Descriptor {
  containers: Record<string, ItemContainer> = {}
  descriptions: Record<string, ItemInstance>  = {}

  static getDescriptionID = ({appid, classid, instanceid = '0'}) =>
    `${appid}/${classid}/${instanceid}`
  static getMarketID = ({market_hash_name, appid}) =>
    `${appid}/${market_hash_name}`
  static getAssetFullID = ({appid, classid = '0', instanceid = '0', contextid = '0', assetid}) =>
    `${appid}/${classid}/${instanceid}/${contextid}/${assetid}`
  static parseAssetFullID = str => {
    const p = str.split('/')
    return {appid: p[0], classid: p[1], instanceid: p[2], contextid: p[3], assetid: p[4]}
  }

  constructor() {
    this.collect = this.collect.bind(this)
    this.collectMany = this.collectMany.bind(this)
    this.getInstance = this.getInstance.bind(this)
    this.getContainer = this.getContainer.bind(this)
    this.appendToAsset = this.appendToAsset.bind(this)
    this.categorizeAssetsByMarketName = this.categorizeAssetsByMarketName.bind(this)
    this.categorizeAssetsByDescription = this.categorizeAssetsByDescription.bind(this)
  }

  collect(description: DescriptionsCommon, replace?: boolean) {
    const descriptionID = Descriptor.getDescriptionID(description)
    if (this.descriptions[descriptionID] && !replace) return this.descriptions[descriptionID]
    const instance = this.descriptions[descriptionID] = new ItemInstance(descriptionID, description)
    const containerID = Descriptor.getMarketID(description)
    if (!this.containers[containerID])
      this.containers[containerID] = new ItemContainer(containerID, this.descriptions[descriptionID])
    else
      this.containers[containerID].addInstance(instance)
    instance.container = this.containers[containerID]
    return instance
  }

  collectMany(descriptions: DescriptionsCommon[], replace?: boolean) {
    for(let i = 0; i < descriptions.length; i++)
      this.collect(descriptions[i], replace)
  }

  remove(description: DescriptionsCommon) {
    this.descriptions[Descriptor.getDescriptionID(description)] = undefined
    this.descriptions[Descriptor.getMarketID(description)] = undefined
  }

  getInstance(asset: Asset) {
    return this.descriptions[Descriptor.getDescriptionID(asset)]
  }

  getContainer(asset: Asset) {
    return this.containers[Descriptor.getMarketID(this.getInstance(asset).description)]
  }

  appendToAsset(asset: Asset, descriptionField = 'descriptions', marketField = 'container') {
    if (descriptionField) asset[descriptionField] = this.getInstance(asset)
    if (marketField) asset[marketField] = this.getContainer(asset)
    return asset
  }

  categorizeAssetsByMarketName(assets: Asset[], mapped = false) {
    const map = {}
    for (const a of assets) {
      const marketID = Descriptor.getMarketID(this.getInstance(a).description)
      if (map[marketID]) map[marketID].assets.push(a)
      else map[marketID] = { market: this.containers[marketID], assets: [a] }
    }
    return mapped ? map : Object.values(map)
  }

  categorizeAssetsByDescription(assets: Asset[], mapped: false)
    : {instance: ItemInstance, assets: Asset[]}[]
  categorizeAssetsByDescription(assets: Asset[], mapped: true)
    : Record<string, {instance: ItemInstance, assets: Asset[]}>
  categorizeAssetsByDescription(assets: Asset[], mapped = false) {
    const map = {}
    for (const a of assets) {
      const descriptionID = Descriptor.getDescriptionID(a)
      if (map[descriptionID]) map[descriptionID].assets.push(a)
      else map[descriptionID] = { instance: this.descriptions[descriptionID], assets: [a] }
    }
    return mapped ? map : Object.values(map)
  }

  toArray() {
    return Object.values(this.descriptions)
  }

}