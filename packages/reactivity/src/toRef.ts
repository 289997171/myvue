import {isReactive} from "./reactive";
import {isArray} from "@vue/shared";


class ObjectRefImpl {
    __v_isRef = true;
    _defaultValue = undefined;

    constructor(public _object, public _key) {
    }

    get value() {
        return this._object[this._key]
    }

    set value(val) {
        this._object[this._key] = val;
    }
}

const toRef = (target, p) => {
    return new ObjectRefImpl(target, p)
}

const toRefs = (proxy) => {
    if (!isReactive(proxy)) {
        console.error('toRefs 参数需要是reactive')
        return
    }
    const result = isArray(proxy) ? new Array(proxy.length) : {}
    for (let p in proxy) {
        result[p] = toRef(proxy, p)
    }

    return result
}

const proxyRefs = (target)=> {
    return new Proxy(target,{
        get(target: any, p: string | symbol, receiver: any): any {
            let result = Reflect.get(target, p, receiver)
            return result.__v_isRef ? result.value : result;
        },
        set(target: any, p: string | symbol, newValue: any, receiver: any): boolean {
            const oldValue = target[p]
            if (oldValue.__v_isRef) {
                oldValue.value = newValue
                return true;
            } else {
                return Reflect.set(target, p, newValue, receiver)
            }
        }
    })
}

export {toRef, toRefs, proxyRefs}
