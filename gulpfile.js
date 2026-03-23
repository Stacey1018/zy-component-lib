import { defineConfig } from "vite" // 引入 Vite 官方方法，用于定义配置
import vue from "@vitejs/plugin-vue" // 引入 Vue 插件，支持 .vue 文件的编译
import dts from "vite-plugin-dts"    // 用于生成 TypeScript 类型声明文件 (.d.ts)
import path from "path"
import fg from "fast-glob"
import { series, parallel } from 'gulp'

import { buildModules } from "./src/viteBuild"

import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const packagesRoot = path.resolve(__dirname, "../packages")

const entryFiles = await fg('**/*.{js,ts,vue}', {
  cwd: path.resolve(__dirname, '../packages'),
  absolute: true,
  onlyFiles: true,
  ignore: ['**/__tests__/**'],
})

console.log('entryFiles', entryFiles)


// 把入口路径单独拿出来，方便在 lib.entry 和 rollupOptions.input 里复用
const libEntry = path.resolve(__dirname, "../packages/index.ts")
console.log('libEntry', libEntry)
// /Users/stacey/yuanmeng/yang/zy-component-lib/packages/index.ts


export default series(
  buildModules)