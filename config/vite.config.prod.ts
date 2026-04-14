import { defineConfig } from "vite" // 引入 Vite 官方方法，用于定义配置
import vue from "@vitejs/plugin-vue" // 引入 Vue 插件，支持 .vue 文件的编译
import dts from "vite-plugin-dts"    // 用于生成 TypeScript 类型声明文件 (.d.ts)
import { viteStaticCopy } from "vite-plugin-static-copy"
import path from "path"
import fs from "fs"

/**
 * 为 `viteStaticCopy({ targets })` 生成 targets：把每个组件的 `style/index.ts` 原样拷贝到 dist。
 *
 * 为什么要拷贝 `style/index.ts`？
 * - 我们的 resolver 会为每个组件注入副作用 import，例如：
 *   `import "zy-component-lib/dist/button/style/index"`
 * - 因此打包产物里必须真的存在 `dist/<component>/style/index.ts`（或 .js，取决于你构建产物形态）
 * - 这里选择“静态拷贝源码中的 style 入口文件”，让路径稳定、实现简单
 *
 * 这个函数做了什么？
 * - 扫描 `packages/` 下的所有一级目录（每个目录视为一个组件/子包）
 * - 找出其中存在 `style/index.ts` 的目录
 * - 生成一组 `{ src, dest }`：
 *   - `src`: 要拷贝的源文件绝对路径（`packages/<name>/style/index.ts`）
 *   - `dest`: 拷贝到 `dist/` 下的目标子目录（`<name>/style`）
 */
function getStyleCopyTargets() {
  // packages 目录（你的源码组件都在这里）
  const packagesDir = path.resolve(__dirname, "../packages")

  // 读取 packages 下的所有条目（用 Dirent 方便判断是不是目录）
  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true })

  return (
    dirs
      // 只关心目录：`packages/button`、`packages/input`...
      .filter((dir) => dir.isDirectory())
      .map((dir) => {
        // 约定：只有存在 `packages/<dir>/style/index.ts` 的才认为“支持样式按需入口”
        const styleEntry = path.resolve(packagesDir, dir.name, "style/index.ts")

        // 没有样式入口就跳过（返回 null，后面统一过滤）
        if (!fs.existsSync(styleEntry)) return null

        // 交给 viteStaticCopy：
        // - src 是具体文件
        // - dest 是 dist 下的相对目录（最终会得到 dist/<dir>/style/index.ts）
        return {
          src: styleEntry,
          dest: `${dir.name}/style`,
        }
      })
      // 过滤掉 null；再用类型断言让 TS 知道返回值是 targets 数组
      .filter(Boolean) as { src: string; dest: string }[]
  )
}

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
    viteStaticCopy({
      targets: [
        ...getStyleCopyTargets(),
        {
          src: path.resolve(__dirname, "../packages/theme"),
          dest: "",
        },
      ],
    }),
  ],
  build: {
    outDir: "dist", // 打包输出目录为 dist
    lib: {
      entry: path.resolve(__dirname, "../packages/index.ts"), // 库入口文件
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
