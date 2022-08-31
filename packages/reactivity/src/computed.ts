/**
 * options可以是一个函数|对象{get, set}
 * @param options
 */
import {track, trigger} from "./effect";

const computed = (options)=> {
    const getFn = options.get || options
    const setFn = options.set || undefined

    // 先计算一次value
    const _value = getFn()

    const target = {
        // 缓存数据
        value: _value,
        // 脏
        dirty: false
    }
    const proxy = new Proxy(target, {
        get(target: any, p: string | symbol, receiver: any): any {
            if (p === 'value') {
                if (target.dirty) {
                    target.value = getFn()
                }

                // 触发收集
                track(target, 'get', p)

                return target.value
            }
            return null;
        },
        set(target: any, p: string | symbol, newValue: any, receiver: any): boolean {
            if (setFn) {
                // 执行set函数
                setFn(newValue)

                // 标记数据已脏,需要更新
                target.dirty = true

                // 触发
                trigger(target, 'set', p, newValue, target.value)

                return true;
            }
            return false;
        }
    })

    return proxy
}

export {computed}
