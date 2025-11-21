// build/vite.config.ts
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
// vite-plugin-dts Vite 项目中生成 TypeScript 类型声明文件 (.d.ts) 的插件
// 主要作用是让你的库或组件在发布后，能够被 TypeScript 项目正确识别类型。它在开发组件库或库项目时非常常用。
import dts from "vite-plugin-dts"
import path from "path"

export default defineConfig({
  plugins: [vue(), dts({ outDir: "dist/types" })],
  build: {
    outDir: "dist",
    lib: {
      entry: path.resolve(__dirname, "../packages/index.ts"),
      name: "ZyComponentLib",
      fileName: (format) => `zy-component-lib.${format}.js`,
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: { vue: "Vue" },
        preserveModules: true,
        preserveModulesRoot: "packages",
      },
    },
  },
})
