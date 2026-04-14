# 优化样式按需引入的打包产物

在第 03 篇里我们已经做到“组件按需注入样式入口”，例如 resolver 注入：

```ts
import "zy-component-lib/dist/button/style/index"
```

但此时会遇到两个工程化问题：

- **问题 1：`dist/<component>/style/index.ts` 仍是 TS 文件**（通过静态拷贝得到），对发布包不够友好。
- **问题 2：如果把 `style/index.ts` 当成 rollup entry**，当它只有一行 `import "../../theme/button.scss"` 时，**编译后的 `index.es.js` 可能为空**（CSS 会被抽离，JS 入口被认为“没有运行时代码”）。

本文目标：让最终发布包里存在**可被 import 的 JS 样式入口**，同时真正把主题样式输出成 **CSS 文件**，最终形成：

```text
dist/
  theme/
    button.css
  button/
    style/
      index.js        // import '../../theme/button.css'
```

## 原因解释：为什么 entry 只有 CSS import 会“变空”

当某个 entry 文件只有样式 import：

```ts
import "../../theme/button.scss"
```

构建时样式会被抽离成单独的 css 资源，Rollup/Vite 可能会把该 entry 的 JS 内容清空（因为没有可执行的 JS 逻辑）。

所以我们不强依赖“rollup 产出非空的 style entry JS”，而是改为：

- **主题 scss → 预编译为 dist/theme/*.css**
- **style/index.ts → 构建后生成 dist/<component>/style/index.js**，并把里面的 scss 引用改为 css 引用

## 最终方案

构建链路分三步：

1. **预编译主题 scss**：`packages/theme/*.scss` → `dist/theme/*.css`
2. **正常打包组件**：`vite build --config ./config/vite.config.prod.ts`（保留 `preserveModules` 等）
3. **生成/覆盖样式入口 JS**：把 `packages/*/style/index.ts` 复制到 `dist/*/style/index.js`，并将其中的 `.scss` 全部替换为 `.css`

### 1）预编译 theme：`config/build-theme.ts`

（之前是静态拷贝 `packages/theme` 到 `dist/theme`，现在改为直接输出可被浏览器加载的 `.css`）

```ts
import * as sass from "sass"
import fs from "fs"
import path from "path"
import fg from "fast-glob"

const themeDir = path.resolve("packages/theme")
const outDir = path.resolve("dist/theme")

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

const files = fg.sync("*.scss", { cwd: themeDir })

files.forEach((file) => {
  const result = sass.compile(path.join(themeDir, file))
  const cssFile = file.replace(".scss", ".css")
  fs.writeFileSync(path.join(outDir, cssFile), result.css)
})

console.log("theme build success")
```

### 2）组件打包配置要点

- 开启 `preserveModules` + `preserveModulesRoot`
- 不需要再用 `viteStaticCopy` 复制 `packages/theme`（因为 theme 已经编译到 `dist/theme`）

（完整配置以 `config/vite.config.prod.ts` 为准，这里只强调思路。）

### 3）生成样式入口 JS：`config/copy-style.ts`

把 `packages/*/style/index.ts` 复制到 `dist/*/style/index.js`，并把其中的 `.scss` 改成 `.css`：

```ts
import fs from "fs"
import path from "path"
import fg from "fast-glob"

const root = process.cwd()
const packagesDir = path.resolve(root, "packages")
const distDir = path.resolve(root, "dist")

async function copyStyle() {
  // 找到所有组件的 style/index.ts
  const files = await fg("*/style/index.ts", { cwd: packagesDir })

  for (const file of files) {
    const absPath = path.resolve(packagesDir, file)

    let content = fs.readFileSync(absPath, "utf-8")

    // 发布包里我们只保留对 dist/theme/*.css 的引用
    content = content.replace(/\.scss/g, ".css")

    // 输出为 JS（因为最终要给用户 import）
    const outFile = path.resolve(distDir, file.replace(".ts", ".js"))
    fs.mkdirSync(path.dirname(outFile), { recursive: true })
    fs.writeFileSync(outFile, content)
  }

  console.log("style copied successfully")
}

copyStyle()
```

## 构建命令（package.json）

建议把构建串起来：

```json
{
  "build": "tsx ./config/build-theme.ts && vite build --config ./config/vite.config.prod.ts && tsx ./config/copy-style.ts"
}
```

## 验证产物

打包后应看到类似目录（省略无关文件）：

```text
dist/
  theme/
    button.css
  button/
    style/
      index.js
```

并且 `dist/button/style/index.js` 内容类似：

```js
import "../../theme/button.css"
```

最后运行 `play` 验证：

![alt text](./images/04/image.png)

## 常见坑

- **忘记先 `build-theme`**：会导致 `dist/theme/*.css` 不存在，运行时或构建时出现找不到文件。
- **`copy-style` 没在最后执行**：会导致 `dist/<component>/style/index.js` 不存在或仍然引用 `.scss`。
- **路径约定不一致**：`style/index.ts` 里对 `../../theme/...` 的相对路径要和最终 `dist` 目录结构一致。
