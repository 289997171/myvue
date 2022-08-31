import {isObject} from "@vue/shared";
import {reactive} from "./reactive";
import {trackDep, triggerEffects} from "./effect";

class RefImpl {

    _value;
    dep = new Set();
    __v_isRef = true;
    constructor(public rawValue) {
        this._value = toReactive(rawValue)
    }

    get value() {
        // 收集
        trackDep(this.dep)

        return this._value
    }

    set value(val) {
        if (this.rawValue !== val) {
            this.rawValue = val;
            this._value = toReactive(val)

            // 触发
            triggerEffects(this.dep)
        }
    }
}

const toReactive = (val)=> {
    // 如果是对象
    return isObject(val) ? reactive(val) : val
}

const ref = (val)=> {
    return new RefImpl(val)
}

export {ref}
