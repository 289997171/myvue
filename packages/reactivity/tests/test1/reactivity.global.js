(() => {
  // packages/shared/src/index.ts
  var isObject = (val) => {
    return val !== null && typeof val === "object";
  };

  // packages/reactivity/src/index.ts
  console.log(isObject({}));
  console.log(isObject(true));
})();
//# sourceMappingURL=reactivity.global.js.map
