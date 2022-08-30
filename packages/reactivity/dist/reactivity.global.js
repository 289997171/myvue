(() => {
  // packages/shared/src/index.ts
  var isObject = (val) => {
    return val !== null && typeof val === "object";
  };

  // packages/reactivity/src/index.ts
  var a = {};
  isObject(a);
})();
//# sourceMappingURL=reactivity.global.js.map
