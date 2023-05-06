import SteamWeb from "../SteamWeb";
import {wait} from "./index";

interface SteamWebModule {
    web: SteamWeb
}

type KnownProps = 'steamid' | 'profile' | 'webapi'
const propRoute = (instance: SteamWebModule, prop: KnownProps) => {
    switch (prop) {
        case 'profile': return {
            get: () => instance.web.props.profileUrl,
            update: instance.web.updateMyProfileURL.bind(instance.web)
        }
        case 'steamid': return {
            get: () => instance.web.session.steamid,
            update: instance.web.session.updateRefreshToken.bind(instance.web.session)
        }
        case 'webapi': return {
            get: () => instance.web.props.webapi,
            update: () => instance.web.webapi.update('localhost') //temp todo
        }
        default: return {
            get: () => {throw new Error()},
            update: () => {throw new Error()}
        }
    }
}

export function needsProp(prop: KnownProps) {
    return function(target: any, key: string, descriptor: PropertyDescriptor) {
        let originalMethod = descriptor.value, updatingPromise: Promise<any> = null;
        descriptor.value = async function (this: SteamWebModule, ...args: any[]) {
            const proproute = propRoute(this, prop)
            if(updatingPromise) return updatingPromise.then(() => originalMethod.apply(this, args))
            if(proproute.get() !== null) return (this[key] = originalMethod).apply(this, args)
            return updatingPromise = proproute.update().then(() => {
                if(proproute.get() === null) throw new Error('unable to auto update prop ' + prop)
                return (this[key] = originalMethod).apply(this, args)
            })
        }
    }
}

export function retryable(target: any, key: string, descriptor: PropertyDescriptor) {
    let originalMethod = descriptor.value, triesLeft = 5, retryDelay = 500
    const reset = (andReturn) => {
        triesLeft = 5
        retryDelay = 500
        return andReturn
    }
    descriptor.value = function(...args: any[]) {
        return originalMethod.apply(this, args)
            .then(r => reset(r))
            .catch(e => {
                if(triesLeft-- < 0) throw reset(e)
                return wait(retryDelay *= 2)
                    .then(() => descriptor.value.apply(this, ...args))
            })
    }
}