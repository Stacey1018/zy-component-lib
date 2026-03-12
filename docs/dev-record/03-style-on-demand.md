# 样式按需引入

## 目标：样式不需要再main.ts中单独引入

实现方式：按需引入组件的时候，自动引入样式

[unplugin-vue-components](https://www.npmjs.com/package/unplugin-vue-components)可以自己写resolvers，
resolver 返回对象

```ts
interface ComponentResolveResult {
  name: string
  from: string
  as?: string
  sideEffects?: string | string[] // 自动引入 style
}
```

修改ZyElementResolver

```js
export default function ZyElementResolver() {
  return {
    type: "component" as const,
    resolve: (componentName: string) => {
      console.log('componentName', componentName)
      // where `componentName` is always CapitalCase
      if (componentName.startsWith("Zy")) return {
        name: componentName,
        from: "zy-component-lib",
        sideEffects: "zy-component-lib/dist/index.css"
      }
    },
  }
}
```

当使用组件时，插件自动生成

```js
import { Button } from "zy-component-lib"
import "zy-component-lib/dist/index.css"
```

## 运行play查看是否生效

![alt text](./images/03/image.png)
可以看到样式已经自动引入了

问题，多个组件时，回导致重复引入 `import 'zy-component-lib/dist/index.css'`

## 解决方法

### 让打包后的目录保持原目录

现在目录：
```
├── dist
│   ├── index.cjs.js
│   ├── index.css
│   ├── index.es.js
│   ├── index.umd.js
│   ├── types
│   │   ├── button
│   │   ├── index.d.ts
│   │   └── utils
│   └── vite.svg
```

- 修改打包配置

```js
export default defineConfig({
     lib: {
       entry: path.resolve(__dirname, "../packages/index.ts"), // 库入口文件
       name: "ZyComponentLib", // UMD/IIFE 模式下挂载到 window/global 的变量名
-      fileName: (format) => `index.${format}.js`, // 输出文件名，格式化为 es/cjs/umd
-      formats: ["es", "cjs", "umd"], // 输出格式：ESModule、CommonJS、UMD
+      fileName: (format, entryName) => `${entryName}.${format}.js`,
+      // fileName: (format) => `index.${format}.js`, // 输出文件名，格式化为 es/cjs/umd
+      // formats: ["es", "cjs", "umd"], // 输出格式：ESModule、CommonJS、UMD
+      formats: ["es", "cjs"], // 输出格式：ESModule、CommonJS  umd会导致inlineDynamicImports为true,导致和pre
serveModules冲突
     },
     rollupOptions: {
       external: ["vue"], // 指定外部依赖，避免将 vue 打包进库
       output: {
-        globals: { vue: "Vue" }, // UMD 全局变量映射，告诉 Rollup vue 在全局下叫 Vue
+        // globals: { vue: "Vue" }, // UMD 全局变量映射，告诉 Rollup vue 在全局下叫 Vue
         exports: "named", // 避免同时使用 default 和 named 导出时的警告
         // 将提取的 CSS 输出为 index.css
-        assetFileNames: (assetInfo) =>
-          assetInfo.name?.endsWith(".css") ? "index.css" : "assets/[name]-[hash][extname]"
-        // preserveModules: true,          // 如果开启，会保留原有目录结构，适合按需引入（注释掉表示不使用）
-        // preserveModulesRoot: "packages", // preserveModules 时的根目录
+        // assetFileNames: (assetInfo) => assetInfo.name?.endsWith(".css") ? "index.css" : "assets/[name]-[hash][extname]",
+        preserveModules: true,          // 如果开启，会保留原有目录结构，适合按需引入（注释掉表示不使用）
+        preserveModulesRoot: "packages", // preserveModules 时的根目录
       },
     },
   },
```

打包后目录
```
├── dist
│   ├── button
│   │   ├── index.cjs.js
│   │   ├── index.es.js
│   │   └── src
│   ├── index.cjs.js
│   ├── index.es.js
│   ├── types
│   │   ├── button
│   │   ├── index.d.ts
│   │   └── utils
│   ├── utils
│   │   ├── resolver.cjs.js
│   │   ├── resolver.es.js
│   │   ├── withInstall.cjs.js
│   │   └── withInstall.es.js
│   ├── vite.svg
│   └── zy-component-lib.css
```

打包后样式还是都生成在zy-component-lib.css文件下

由于我们要把样式做到按需引入，那那么怎么引入呢

思路： 将样式提取出来到theme文件夹下，packages/button/style/index.ts中导入scss样式,打包后，theme原样写入到dist,

- 创建theme文件夹
- `styles/variables.scss`移动到theme下
- `packages/theme/button.scss`,写入样式
```scss
@use './variables.scss' as *;  // 这是为了打包后路径是对的（继续看打包部分就可以理解了）

.zy-button {
  padding: 8px 16px;
  border-radius: 6px;
  color: #fff;
  background-color: $color-primary;
  &--success { background-color: $color-success; }
  &--warning { background-color: $color-warning; }
  &--danger { background-color: $color-danger; }
}
```

- `packages/button/style/index.ts`
```ts
import '../../theme/button.scss'
```
## 打包

我们需要实现以下两点
- 打包后button/style保持目录（为后续resover做铺垫）
- theme文件夹平移到dist ()

```
```

### 修改打包配置

```ts
import { defineConfig } from "vite" // 引入 Vite 官方方法，用于定义配置
import vue from "@vitejs/plugin-vue" // 引入 Vue 插件，支持 .vue 文件的编译
import dts from "vite-plugin-dts"    // 用于生成 TypeScript 类型声明文件 (.d.ts)
import { viteStaticCopy } from "vite-plugin-static-copy"
import path from "path"
import fs from "fs"

function getStyleCopyTargets() {
  const packagesDir = path.resolve(__dirname, "../packages")
  const dirs = fs.readdirSync(packagesDir, { withFileTypes: true })

  return dirs
    .filter((dir) => dir.isDirectory())
    .map((dir) => {
      const styleEntry = path.resolve(packagesDir, dir.name, "style/index.ts")
      if (!fs.existsSync(styleEntry)) return null
      return {
        src: styleEntry,
        dest: `${dir.name}/style`,
      }
    })
    .filter(Boolean) as { src: string; dest: string }[]
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

```
打包后，目录都变成了

```
├── dist
│   ├── button
│   │   ├── index.cjs.js
│   │   ├── index.es.js
│   │   ├── src
│   │   │   ├── button.vue.cjs.js
│   │   │   ├── button.vue.cjs2.js
│   │   │   ├── button.vue.es.js
│   │   │   └── button.vue.es2.js
│   │   └── style
│   │       └── index.ts
│   ├── index.cjs.js
│   ├── index.es.js
│   ├── theme
│   │   ├── button.scss
│   │   └── variables.scss
│   ├── types
│   │   ├── button
│   │   │   ├── index.d.ts
│   │   │   ├── src
│   │   │   └── style
│   │   ├── index.d.ts
│   │   └── utils
│   │       ├── resolver.d.ts
│   │       └── withInstall.d.ts
│   ├── utils
│   │   ├── resolver.cjs.js
│   │   ├── resolver.es.js
│   │   ├── withInstall.cjs.js
│   │   └── withInstall.es.js
│   └── vite.svg
```

修改resolver,
```ts
export default function ZyElementResolver() {
  return {
    type: "component" as const,
    resolve: (componentName: string) => {
      console.log('componentName', componentName)
      // where `componentName` is always CapitalCase
      if (componentName.startsWith("Zy")) {
        const partialName = componentName.slice(2) // 去掉前缀 Zy
        const dirName = partialName.toLowerCase()  // 目录采用小写
        return {
          name: componentName,
          from: "zy-component-lib",
          sideEffects: `zy-component-lib/dist/${dirName}/style/index`,
        }
      }
    },
  }
}
```
这样使用组件时，由原来的
```js
import { Button } from "zy-component-lib"
import "zy-component-lib/dist/index.css"
```

变为
```js
import { Button } from "zy-component-lib"
import "zy-component-lib/dist/button/style/index"
```

使用多个组件，就会按需引入对应组件的样式。