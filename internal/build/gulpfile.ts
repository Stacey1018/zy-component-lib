import { defineConfig } from "vite" // 引入 Vite 官方方法，用于定义配置
import vue from "@vitejs/plugin-vue" // 引入 Vue 插件，支持 .vue 文件的编译
import dts from "vite-plugin-dts"    // 用于生成 TypeScript 类型声明文件 (.d.ts)
import path from "path"
import fg from "fast-glob"
import { series, parallel } from 'gulp'

import { buildModules } from "./src/viteBuild"





export default series(
  buildModules)