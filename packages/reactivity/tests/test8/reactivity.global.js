var VueReactivity = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    effect: () => effect,
    reactive: () => reactive
  });

  // packages/shared/src/index.ts
  var isObject = (val) => {
    return val !== null && typeof val === "object";
  };

  // packages/reactivity/src/effect.ts
  var collectingEffect = void 0;
  var ReactiveEffect = class {
    constructor(renderFn) {
      this.renderFn = renderFn;
      this.needCollect = true;
      this.parentEF = void 0;
      this.deps = [];
    }
    run() {
      if (!this.needCollect)
        this.renderFn();
      else {
        try {
          this.parentEF = collectingEffect;
          collectingEffect = this;
          return this.renderFn();
        } finally {
          collectingEffect = this.parentEF;
          this.parentEF = null;
        }
      }
    }
  };
  var effect = (renderFn) => {
    const re = new ReactiveEffect(renderFn);
    re.run();
  };
  var targetP_EFs = /* @__PURE__ */ new WeakMap();
  var track = (target, type, p) => {
    if (!collectingEffect) {
      return;
    }
    let depsMap = targetP_EFs.get(target);
    if (!depsMap) {
      targetP_EFs.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(p);
    if (!dep) {
      depsMap.set(p, dep = /* @__PURE__ */ new Set());
    }
    if (!dep.has(collectingEffect)) {
      console.log("track...", p);
      dep.add(collectingEffect);
      collectingEffect.deps.push(dep);
    }
  };
  var trigger = (target, type, p, newValue, oldValue) => {
    const pEFs = targetP_EFs.get(target);
    if (!pEFs)
      return;
    const efs = pEFs.get(p);
    if (efs) {
      console.log("trigger...", p);
      efs.forEach((effect2) => {
        if (effect2 == collectingEffect)
          console.warn("effect\u4E2D\u4FEE\u6539\u6536\u5230\u7684\u7684\u5C5E\u6027\u503C,\u5FFD\u7565\u89E6\u53D1,\u76F4\u63A5\u5728\u5F53\u524D\u6E32\u67D3\u51FD\u6570\u5C31\u80FD\u751F\u6548!");
        else
          effect2.run();
      });
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  var reactive = (target) => {
    if (!isObject(target)) {
      console.error("reactive\u53EA\u652F\u6301\u5BF9\u8C61\u7684\u8F6C\u6362:", target);
      return;
    }
    if (target["__v_isReactive" /* IS_REACTIVE */])
      return target;
    let proxy = reactiveMap.get(target);
    if (proxy)
      return proxy;
    proxy = new Proxy(target, {
      get(target2, p, receiver) {
        if (p === "__v_isReactive" /* IS_REACTIVE */)
          return true;
        track(target2, "get", p);
        return Reflect.get(target2, p, receiver);
      },
      set(target2, p, value, receiver) {
        let result = false;
        const oldValue = target2[p];
        if (oldValue !== value) {
          result = Reflect.set(target2, p, value, receiver);
          trigger(target2, "set", p, value, oldValue);
        }
        return result;
      }
    });
    reactiveMap.set(target, proxy);
    return proxy;
  };
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
