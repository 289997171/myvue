import {ReactiveEffect} from "./effect";
import {isReactive} from "./reactive";
import {isFunction, isObject} from "@vue/shared";


/**
 * 递归便利对象
 * @param target
 * @param set
 */
const traversal = (target, set = new Set()) =>{
    if (!isObject(target)) return target

    if (set.has(target)) return target

    set.add(target)
    for (let p in target) {
        traversal(target[p], set)
    }

    return target
}

const watch = (target, cb) => {

    let getter;
    if (isReactive(target)) {
        getter = ()=> {
            // 需要递归遍历对象属性,那么属性将被依赖收集
            return traversal(target);
        }
    } else if (isFunction(target)){
        getter = target
    } else {
        console.error('watch需要响应式对象|getter函数')
        return
    }

    let cleanupHandle;
    const onCleanup = (_cleanupHandle)=> {
        cleanupHandle = _cleanupHandle
    }

    let oldValue;
    const job = ()=> {
        if (cleanupHandle) cleanupHandle() // 下一次watch开始触发上衣次watch的cleanup

        const newValue = effect.run()
        cb(newValue, oldValue, onCleanup)
        oldValue = newValue;
    }

    const effect = new ReactiveEffect(getter, job)
    oldValue = effect.run()
}

export {watch}
