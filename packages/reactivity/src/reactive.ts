import {isObject} from "@vue/shared";


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

    let proxy = reactiveMap.get(target)
    // 判断原始对象是否已经创建过对应的代理对象
    if (proxy) return proxy;

    proxy = new Proxy(target, {
        get(target: any, p: string | symbol, receiver: any): any {
            //return target[p]
            return Reflect.get(target, p, receiver);
        },
        set(target: any, p: string | symbol, value: any, receiver: any): boolean {
            // target[p] = value;
            // return true;
            return Reflect.set(target, p, value, receiver)
        }
    })

    return proxy
}

export {reactive}
