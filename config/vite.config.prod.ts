import { defineConfig } from "vite" // 引入 Vite 官方方法，用于定义配置
import vue from "@vitejs/plugin-vue" // 引入 Vue 插件，支持 .vue 文件的编译
import dts from "vite-plugin-dts"    // 用于生成 TypeScript 类型声明文件 (.d.ts)
import path from "path"
import fg from "fast-glob"


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

// 导出 Vite 配置
export default defineConfig({
  plugins: [
    vue(), // 使用 Vue 插件
    dts({
      entryRoot: path.resolve(__dirname, "../packages"), // 类型文件入口根目录，插件会扫描 packages 下的所有 TS/组件文件
      outDir: "dist/types", // 类型文件输出目录为 dist/types
      // 生成的 .d.ts 文件会按照目录结构保存在 dist/types 下
      insertTypesEntry: true, // 插入类型入口文件
      tsconfigPath: path.resolve(__dirname, "../tsconfig.build.json"),
    }),
  ],
  build: {
    outDir: "dist", // 打包输出目录为 dist
    cssCodeSplit: true, // 按入口拆分 CSS，这样 button/style/index 会产出自己的 CSS，且 JS 里会带 import
    lib: {
      entry: entryFiles, // 库入口文件
      name: "ZyComponentLib", // UMD/IIFE 模式下挂载到 window/global 的变量名
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      // fileName: (format) => `index.${format}.js`, // 输出文件名，格式化为 es/cjs/umd
      // formats: ["es", "cjs", "umd"], // 输出格式：ESModule、CommonJS、UMD
      formats: ["es", "cjs"], // 输出格式：ESModule、CommonJS  umd会导致inlineDynamicImports为true,导致和preserveModules冲突
    },
    rollupOptions: {
      external: ["vue"], // 指定外部依赖，避免将 vue 打包进库
      output: {
        exports: "named", // 避免同时使用 default 和 named 导出时的警告
        preserveModules: true,          // 如果开启，会保留原有目录结构，适合按需引入（注释掉表示不使用）
        preserveModulesRoot: "packages", // preserveModules 时的根目录
      },
    },
  },
})