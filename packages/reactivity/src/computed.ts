/**
 * options可以是一个函数|对象{get, set}
 * @param options
 */
import {ReactiveEffect, trackDep, triggerEffects} from "./effect";

class ComputedRefImpl {
    _value;
    effect;
    _dirty = true;
    __v_isReadonly = true;
    __v_isRef = true;
    dep = new Set();

    constructor(public getter, public setter) {
        // 如果有setter就不是只读
        if (setter) this.__v_isReadonly = false

        this.effect = new ReactiveEffect(getter, () => {
            // 监听到属性变化了,触发调度器
            if (!this._dirty) {
                this._dirty = true
                //trigger(this, 'set', 'value', null, null)
                triggerEffects(this.dep)
            }
        })
    }

    // 调用computed返回值的value,触发effect去进行属性收集,并且获得第一次执行时的结果,设置缓存
    get value() {

        // get的时候进行属性收集
        //track(this, 'get', 'value')
        trackDep(this.dep)

        if (this._dirty) {
            this._dirty = false
            this._value = this.effect.run()
        }
        return this._value
    }

    set value(newValue) {
        if (this.setter) this.setter(newValue)
    }
}

const computed = (options) => {
    return new ComputedRefImpl(options.get || options, options.set || undefined)
}

export {computed}
