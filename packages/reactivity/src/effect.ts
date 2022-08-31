// 当前正在进行收集的effect
// 导出的是变量,相当与指针,并不是undefined值!!!
export let collectingEffect = undefined;

class ReactiveEffect {
    // 是否需要收集对应函数中的响应式变量,默认true:需要进行收集
    needCollect = true;
    // 由于可能嵌套effect的情况,我们需要记录当前effect的父effect,从而解决嵌套带来activeEffect不明确的问题!
    // 相对于入栈出栈性能更好
    parentEF = undefined;
    // [ef1,ef2, ...]
    deps = []

    constructor(public renderFn) {
    }

    run() {
        // 如果不需要收集,直接执行对应的渲染函数
        if (!this.needCollect) this.renderFn()
        else {
            // 进行依赖收集,核心就是将当前的effect 和 稍后渲染的属性进行关联

            try {
                // 考虑effect嵌套情况下,当前effect改变全局activeEffect之前,记录父effect
                this.parentEF = collectingEffect;

                // 当前effect第一次run的时候,将其保存到全局变量中
                collectingEffect = this;

                // TODO 解决分支渲染,收集属性依旧保存不必要的属性问题
                // TODO 如多当前执行是因为trigger,那么会导致死循环
                /*
                 死循环原因:
                 let set = new Set(['a])
                 set.forEach(item=> {
                    set.delete('a')
                    set.add('a')
                 })
                */
                {
                    // this.deps = [] 不能这样处理,这样仅仅是将自己的数组修改,我们需要将deps里面的set清空后,重新收集
                    for (let i = 0; i < this.deps.length; i++) {
                        this.deps[i].delete(this) // 这里删除后,targetP_EFs 对应的也会被删除
                    }
                    this.deps.length = 0;
                }

                // 执行对应的渲染函数,该渲染函数执行时就能获得全局的activeEffect
                // 那么渲染函数中的响应式变量Proxy在执行get的时候也能获得全局的activeEffect,从而将响应式变量与effect进行关联
                return this.renderFn();
            } finally {
                collectingEffect = this.parentEF;
                this.parentEF = null;


                // TODO 由于解决嵌套执行依赖 collectingEffect,而collectingEffect依赖属性收集,故这里不能取消属性收集!
                // TODO 由于条件渲染,如果effect只在第一次执行的时候收集依赖,也不能达到效果,故这里不能取消属性收集!
                // this.needCollect = false;
            }

        }

    }
}

/**
 * effect默认执行一次
 * effect核心逻辑是收集函数中的响应式变量,
 * 每当收集的响应式变量改变,触发effect对应的函数重新执行
 * @param renderFn 渲染函数
 */
const effect = (renderFn) => {

    const re = new ReactiveEffect(renderFn)

    // 默认执行一次
    re.run()
}

/**
 * 收集对象的那些属性导致那些effect执行!!!
 * 对象 -> 属性 -> effect
 * k: 原始对象
 * v: Map
 *      k: 原始对象的属性名称
 *      v: Set 保存effect,就是该属性可能导致那些effect渲染函数重新渲染
 *      {obj, {p: [ef1, ef2, ...]}}
 */
const targetP_EFs = new WeakMap();
/**
 * Proxy执行的收集函数
 * @param target 原始对象
 * @param type get/set 一般是Proxy:get
 * @param p 原始对象的属性
 */
const track = (target, type, p) => {
    if (!collectingEffect) {
        //console.warn('当前没有正在进行依赖收集的effect, 这种情况存在于渲染函数在非effect中执行')
        return;
    }

    let depsMap = targetP_EFs.get(target)
    if (!depsMap) {
        // k:属性名 v:Set
        targetP_EFs.set(target, depsMap = new Map())
    }

    let dep = depsMap.get(p)
    if (!dep) {
        depsMap.set(p, dep = new Set())
    }

    if (!dep.has(collectingEffect)) {
        console.log('track...', p)
        // 双向关联,多对多
        dep.add(collectingEffect) // 注意collectingEffect之后改变不会影响dep里面的值!!!
        collectingEffect.deps.push(dep) // 让effect记录对应的dep,在之后清理的时候会用到
    }

    // 打印对象被收集到的属性
    console.log('depsMap', depsMap)
}


/*
需要考虑嵌套情况,依赖parentEF

effect(()=> {
    xxx.xxx
    effect(()=> {
        yyy.yyy
    })

    effect(()=> {
        yyy.yyy
    })
})


需要考虑effect删除依赖的情况
当flag改变,对应proxy收集的属性也改变了
effect(()=> {
    flag ? proxy.xxx : proxy.yyy
})
*/


const trigger = (target, type, p, newValue, oldValue) => {
    const pEFs = targetP_EFs.get(target)
    if (!pEFs) return; // 触发的值,没有对应的effects

    const efs = pEFs.get(p)
    if (efs) {
        console.log('trigger...', p)
        efs.forEach(effect => {

            // 考虑嵌套循环,执行effect.run可能是effect本身
            /*
                参见: test71.html
                effect(()=> {
                    console.log('effect...')

                    // TODO effect中修改收到的的属性值,将导致嵌套循环!!!
                    // set 导致 effect
                    // effect 导致 set
                    // ...嵌套循环
                    state.age++

                    document.getElementById('app').innerHTML = `${state.name} 今年 ${state.age} 岁`
                })
            */
            if (effect === collectingEffect) console.warn('effect中修改收到的的属性值,忽略触发,直接在当前渲染函数就能生效!')
            else effect.run()
        })
    }
}


export {effect, track, trigger}
