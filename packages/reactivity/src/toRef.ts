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

export {toRef, toRefs}
