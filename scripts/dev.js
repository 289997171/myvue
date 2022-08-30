const path = require('path');
const esbuild = require('esbuild');

// minimist解析参数
const args = require('minimist')(process.argv.slice(2)) // node scripts/dev.js reactivity -f global  { _: [ 'reactivity' ], f: 'global' }
const target = args._[0] || 'reactivity'
const format = args.f || 'global'

// 获得模块package.json
const pkg = require(path.resolve(__dirname, `../packages/${target}/package.json`))

// 使用esbuild打包
esbuild.build({
    // 入口文件
    entryPoints: [path.resolve(__dirname, `../packages/${target}/src/index.ts`)],
    // 输入文件
    outfile: path.resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`),
    // 把所有的包全部打包的一起
    bundle: true,
    // 需要sourcemap
    sourcemap: true,
    // 全局名称,也就是将模块申明一个名称,方便使用时候通过模块名称获得,
    // var VueReactivity = (()=>{xxx})()
    // 否则... (()=>{xxx})()  const {reactive} = VueReactivity 将无法获得!!!
    globalName: pkg.buildOptions?.name,
    // 输入格式
    // iife 立即执行函数               (function(){})()
    // cjs node中的模块               module.exports
    // esm 浏览器中的esModule模块      import
    format: format.startsWith('global') ? 'iife' : (format === 'cjs' ? 'cjs' : 'esm'),
    // 打包的平台
    platform: format === 'cjs' ? 'node' : 'browser',
    // 使用到的插件
    // plugins: [xxx],
    watch: {
        // 监听文件变化,执行重新打包
        onRebuild(error) {
            if (!error) console.log(`esbuild rebuild...`, new Date())
        }
    }

}).then(() => {
    console.log('esbuild watching...', new Date())
})
