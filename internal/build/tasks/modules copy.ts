import { build } from 'vite'
import vue from "@vitejs/plugin-vue" // 引入 Vue 插件，支持 .vue 文件的编译
import dts from "vite-plugin-dts"    // 用于生成 TypeScript 类型声明文件 (.d.ts)
import path from "path"
import glob from "fast-glob"
import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from 'rollup-plugin-esbuild'
import VueMacros from 'unplugin-vue-macros/rollup'


import { writeBundles } from '../utils/rollup'
import { projRoot, pkgRoot, epRoot } from '../utils/path'
import type { OutputOptions, Plugin } from 'rollup'

let entryFiles: any

// 把入口路径单独拿出来，方便在 lib.entry 和 rollupOptions.input 里复用
const libEntry = path.resolve(pkgRoot, "index.ts")
console.log('libEntry', libEntry)
// /Users/stacey/yuanmeng/yang/zy-component-lib/packages/index.ts

const getEntryFiles = async () => {
    return await glob('**/*.{js,ts,vue}', {
        cwd: pkgRoot,
        absolute: true,
        onlyFiles: true,
        ignore: ['**/__tests__/**', '**/style/**'],
    })
}

// vite打包
export const buildModules = async () => {
    entryFiles = await getEntryFiles()
    return build({
        plugins: [
            vue(), // 使用 Vue 插件
            dts({
                entryRoot: pkgRoot, // 类型文件入口根目录，插件会扫描 packages 下的所有 TS/组件文件
                outDir: path.resolve(projRoot, 'dist', 'types'), // 类型文件输出目录为 dist/types
                // 生成的 .d.ts 文件会按照目录结构保存在 dist/types 下
                insertTypesEntry: true, // 插入类型入口文件
                tsconfigPath: path.resolve(projRoot, "tsconfig.build.json"),
            }),
        ],
        build: {
            outDir: path.resolve(projRoot, 'dist'), // 打包输出目录为 dist
            cssCodeSplit: false, // 按入口拆分 CSS，这样 button/style/index 会产出自己的 CSS，且 JS 里会带 import
            lib: {
                entry: entryFiles, // 库入口文件
                name: "ZyComponentLib", // UMD/IIFE 模式下挂载到 window/global 的变量名
                fileName: (format, entryName) => `${entryName}.${format}.js`,
            },
            rollupOptions: {
                external: ["vue"], // 指定外部依赖，避免将 vue 打包进库
                output: [
                    {
                        dir: path.resolve(projRoot, 'dist', 'es'), // 指定所有生成的 chunk 被放置在哪个目录中
                        format: 'es', // 指定生成的 bundle 的格式
                        entryFileNames: '[name].js', // 默认：'[name].js'，类型：string | ((chunkInfo: PreRenderedChunk) => string)
                        exports: 'named', // 指定导出模式 named – 适用于使用命名导出的情况
                        preserveModules: true, // 将使用原始模块名作为文件名，为所有模块创建单独的 chunk，而不是创建尽可能少的 chunk
                        preserveModulesRoot: epRoot, // 确保输入的模块会输出到 es 目录下，而不是在 es/components 下
                    },
                    {
                        dir: path.resolve(projRoot, 'dist', 'lib'),
                        format: 'cjs',
                        entryFileNames: '[name].cjs',
                        exports: 'named',
                        preserveModules: true,
                        preserveModulesRoot: epRoot,
                    },
                ],
                treeshake: {
                    moduleSideEffects: false,
                }
            },
        },
    })
}

// 样式打包


// const getStyleEntryFiles = async () => {
//     return await glob("*/style/index.ts", {
//         cwd: pkgRoot,
//         absolute: true,
//         onlyFiles: true,
//     })
// }
// export const buildModulesStyles = async () => {
//     entryFiles = await getStyleEntryFiles()
//     const ensureExportPlugin = {
//         name: 'ensure-style-export',
//         transform(code: string, id: string) {
//             if (/[/\\]style[/\\]index\.(ts|js)$/.test(id) && !code.includes('export')) {
//                 return { code: code + '\nexport const __stub__ = true;' }
//             }
//             return null
//         }
//     }
//     return build({
//         plugins: [
//             vue(), // 使用 Vue 插件
//             dts({
//                 entryRoot: pkgRoot, // 类型文件入口根目录，插件会扫描 packages 下的所有 TS/组件文件
//                 outDir: path.resolve(projRoot, 'dist', 'types'), // 类型文件输出目录为 dist/types
//                 // 生成的 .d.ts 文件会按照目录结构保存在 dist/types 下
//                 insertTypesEntry: true, // 插入类型入口文件
//                 tsconfigPath: path.resolve(projRoot, "tsconfig.build.json"),
//             }),
//         ],
//         build: {
//             outDir: path.resolve(projRoot, 'dist'), // 打包输出目录为 dist
//             cssCodeSplit: false, // 按入口拆分 CSS，保留各 style/index 入口与对应 CSS chunk
//             minify: false,  // 禁用压缩
//             emptyOutDir: false,
//             lib: {
//                 entry: entryFiles, // 库入口文件
//                 name: "ZyComponentLib", // UMD/IIFE 模式下挂载到 window/global 的变量名
//                 fileName: (format, entryName) => `${entryName}.${format}.js`,
//             },
//             rollupOptions: {
//                 external: ["vue"], // 指定外部依赖，避免将 vue 打包进库
//                 output: [
//                     {
//                         dir: path.resolve(projRoot, 'dist', 'es'), // 指定所有生成的 chunk 被放置在哪个目录中
//                         format: 'es', // 指定生成的 bundle 的格式
//                         entryFileNames: '[name].js', // 默认：'[name].js'，类型：string | ((chunkInfo: PreRenderedChunk) => string)
//                         exports: 'named', // 指定导出模式 named – 适用于使用命名导出的情况
//                         preserveModules: true, // 将使用原始模块名作为文件名，为所有模块创建单独的 chunk，而不是创建尽可能少的 chunk
//                         preserveModulesRoot: 'packages', // 确保输入的模块会输出到 es 目录下，而不是在 es/components 下
//                     },
//                     {
//                         dir: path.resolve(projRoot, 'dist', 'lib'),
//                         format: 'cjs',
//                         entryFileNames: '[name].cjs',
//                         exports: 'named',
//                         preserveModules: true,
//                         preserveModulesRoot: 'packages',
//                     },
//                 ],
//                 treeshake: false,
//             },
//         },
//     })
// }

export const target = 'es2018'

const plugins: Plugin[] = [
    // VueMacros({
    //     setupComponent: false,
    //     setupSFC: false,
    //     plugins: {
    //         vue: vue({
    //             isProduction: true,
    //             template: {
    //                 compilerOptions: {
    //                     hoistStatic: false,
    //                     cacheHandlers: false,
    //                 },
    //             },
    //         }),
    //         vueJsx: vueJsx(),
    //     },
    // }),
    nodeResolve({
        extensions: ['.mjs', '.js', '.json', '.ts'],
    }),
    commonjs(),
    esbuild({
        sourceMap: true,
        target,
        loaders: {
            '.vue': 'ts',
        },
    }),
]

const epOutput = path.resolve(projRoot, 'dist')

const buildConfigEntries = [
    {
        esm: {
            module: 'ESNext',
            format: 'esm',
            ext: 'mjs',
            output: {
                name: 'es',
                path: path.resolve(epOutput, 'es'),
            },
            bundle: {
                path: `dist/es`,
            },
        },
    },
    {
        cjs: {
            module: 'CommonJS',
            format: 'cjs',
            ext: 'js',
            output: {
                name: 'lib',
                path: path.resolve(epOutput, 'lib'),
            },
            bundle: {
                path: `dist/lib`,
            },
        },
    }
]

export const buildModulesStyles = async () => {
    const input =
        await glob('**/style/(index|css).{js,ts,vue}', {
            cwd: pkgRoot,
            absolute: true,
            onlyFiles: true,
        })
        console.log('input',input)
    const bundle = await rollup({
        input,
        plugins,
        treeshake: false,
    })

    await writeBundles(
        bundle,
        buildConfigEntries.map(([module, config]): OutputOptions => {
            return {
                format: config.format,
                dir: path.resolve(config.output.path,),
                exports: module === 'cjs' ? 'named' : undefined,
                preserveModules: true,
                preserveModulesRoot: epRoot,
                sourcemap: true,
                entryFileNames: `[name].${config.ext}`,
            }
        })
    )
}
