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
import vueJsx from '@vitejs/plugin-vue-jsx'


import { writeBundles, generateExternal } from '../utils/rollup'
import { projRoot, pkgRoot, epRoot } from '../utils/path'
import type { OutputOptions, Plugin } from 'rollup'


export const excludeFiles = (files: string[]) => {
    const excludes = ['node_modules', 'test', 'mock', 'gulpfile', 'dist']
    return files.filter((path) => {
        const position = path.startsWith(projRoot) ? projRoot.length : 0
        return !excludes.some((exclude) => path.includes(exclude, position))
    })
}

export const target = 'es2018'
const epOutput = path.resolve(projRoot, 'dist')

const buildConfig = {
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

const buildConfigEntries = Object.entries(buildConfig)

const plugins: Plugin[] = [
    VueMacros({
        setupComponent: false,
        setupSFC: false,
        name: 'vue-macros',
        plugins: {
            vue: vue({
                name: 'vue-macros',
                isProduction: true,
                template: {
                    compilerOptions: {
                        hoistStatic: false,
                        cacheHandlers: false,
                    },
                },
            }),
            vueJsx: vueJsx(),
        },
    }),
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


// vite打包
export const buildModules = async () => {

    const input = excludeFiles(
        await glob(['**/*.{js,ts,vue}', '!**/style/(index|css).{js,ts,vue}'], {
            cwd: pkgRoot,
            absolute: true,
            onlyFiles: true,
        })
    )
    const bundle = await rollup({
        input,
        plugins,
        treeshake: { moduleSideEffects: false },
    })

    await writeBundles(
        bundle,
        buildConfigEntries.map(([module, config]): OutputOptions => {
            return {
                format: config.format,
                dir: config.output.path,
                exports: module === 'cjs' ? 'named' : undefined,
                preserveModules: true,
                preserveModulesRoot: epRoot,
                sourcemap: true,
                entryFileNames: `[name].${config.ext}`,
            }
        })
    )

}

// 样式打包








export const buildModulesStyles = async () => {
    const input =
        await glob('**/style/(index|css).{js,ts,vue}', {
            cwd: pkgRoot,
            absolute: true,
            onlyFiles: true,
        })
    console.log('input', input)
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
