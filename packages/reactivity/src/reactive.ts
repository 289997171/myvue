import {isObject} from "@vue/shared";

// 获得当前正在进行依赖收集的effect
import {track, trigger} from './effect'

const enum ReactiveFlag {
    IS_REACTIVE = '__v_isReactive'
}

// 保存以及原始对象与代理对象隐射
const reactiveMap = new WeakMap() // key只能是对象,如果key指向的对象后面赋值为null,那么WeakMap会自动删除,垃圾回收相关

/**
 * 将js原始对象,依赖Proxy转换成响应式数据
 * 1.reactive只支持对象的转换
 * @param target
 */
const reactive = (target)=> {
    // 1.reactive只支持对象的转换
    if (!isObject(target)) {
        console.error('reactive只支持对象的转换:', target)
        return
    }

    // 如果target是一个代理对象Proxy,直接返回
    if (target[ReactiveFlag.IS_REACTIVE]) return target;

    // 判断原始对象是否已经创建过对应的代理对象
    let proxy = reactiveMap.get(target)
    if (proxy)  return proxy;

    proxy = new Proxy(target, {
        get(target: any, p: string | symbol, receiver: any): any {
            //return target[p]
            // 为代理对象添加标志
            if (p === ReactiveFlag.IS_REACTIVE) return true

            // 进行依赖收集
            track(target, 'get', p)

            let result = Reflect.get(target, p, receiver)
            if (isObject(result)) {
                return reactive(result) // 实现深层代理,而且深层代理是当深层对象有取值操作的时候才创建对应的代理对象,性能更好!
            }

            return result;
        },
        set(target: any, p: string | symbol, value: any, receiver: any): boolean {
            // target[p] = value;
            // return true;

            let result = false;

            const oldValue = target[p]
            if (oldValue !== value) { // 数据变化才更新
                result = Reflect.set(target, p, value, receiver)

                // 触发属性导致effect渲染
                trigger(target, 'set', p, value, oldValue)
            }

            return result;
        }
    })

    // 将原始对象与代理对象建立隐射
    reactiveMap.set(target, proxy)
    return proxy
}

const isReactive = (target)=> {
    return !!(target && target[ReactiveFlag.IS_REACTIVE])
}

export {reactive, isReactive}
