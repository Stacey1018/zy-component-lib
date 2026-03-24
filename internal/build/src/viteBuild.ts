import { build } from 'vite'
import vue from "@vitejs/plugin-vue" // 引入 Vue 插件，支持 .vue 文件的编译
import dts from "vite-plugin-dts"    // 用于生成 TypeScript 类型声明文件 (.d.ts)
import path from "path"
import fg from "fast-glob"
import { projRoot, pkgRoot } from '../utils/path.js'


let entryFiles: any

// 把入口路径单独拿出来，方便在 lib.entry 和 rollupOptions.input 里复用
const libEntry = path.resolve(pkgRoot, "index.ts")
console.log('libEntry', libEntry)
// /Users/stacey/yuanmeng/yang/zy-component-lib/packages/index.ts

const getEntryFiles = async () => {
    return await fg('**/*.{js,ts,vue}', {
        cwd: pkgRoot,
        absolute: true,
        onlyFiles: true,
        ignore: ['**/__tests__/**'],
    })
}


export const buildModules = async() => {
    entryFiles = await getEntryFiles()

    return build({
        plugins: [
            vue(), // 使用 Vue 插件
            dts({
                entryRoot: pkgRoot, // 类型文件入口根目录，插件会扫描 packages 下的所有 TS/组件文件
                outDir: "dist/types", // 类型文件输出目录为 dist/types
                // 生成的 .d.ts 文件会按照目录结构保存在 dist/types 下
                insertTypesEntry: true, // 插入类型入口文件
                tsconfigPath: path.resolve(projRoot, "tsconfig.build.json"),
            }),
        ],
        build: {
            outDir: "dist", // 打包输出目录为 dist
            cssCodeSplit: true, // 按入口拆分 CSS，这样 button/style/index 会产出自己的 CSS，且 JS 里会带 import
            lib: {
                entry: entryFiles, // 库入口文件
                name: "ZyComponentLib", // UMD/IIFE 模式下挂载到 window/global 的变量名
                fileName: (format, entryName) => `${entryName}.${format}.js`,
            },
            rollupOptions: {
                external: ["vue"], // 指定外部依赖，避免将 vue 打包进库
                output: [
                    {
                        dir: 'dist/es', // 指定所有生成的 chunk 被放置在哪个目录中
                        format: 'es', // 指定生成的 bundle 的格式
                        entryFileNames: '[name].js', // 默认：'[name].js'，类型：string | ((chunkInfo: PreRenderedChunk) => string)
                        exports: 'named', // 指定导出模式 named – 适用于使用命名导出的情况
                        preserveModules: true, // 将使用原始模块名作为文件名，为所有模块创建单独的 chunk，而不是创建尽可能少的 chunk
                        preserveModulesRoot: 'packages', // 确保输入的模块会输出到 es 目录下，而不是在 es/components 下
                    },
                    {
                        dir: 'dist/lib',
                        format: 'cjs',
                        entryFileNames: '[name].cjs',
                        exports: 'named',
                        preserveModules: true,
                        preserveModulesRoot: 'packages',
                    },
                ]
            },
        },
    })
}