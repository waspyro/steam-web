import SteamWeb from "../index";

interface SteamWebModule {
    web: SteamWeb
}

type KnownProps = 'steamid' | 'profile'
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