# 解决ts类型问题

## 没有生成types类型文件

原因是dts配置问题，

根目录 tsconfig.json 使用了 project references，且 **"files": []，没有 include**。因此插件认为没有任何文件需要生成声明，只会生成一个占位入口 index.d.ts（内容为 export {}）

tsconfig.build.json

## package.json

exports中也需要增加 "types": "./dist/types/index.d.ts",
```json
{
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
    },
  }
}
```

原因：一旦包用了 exports，Node/TypeScript 会只按 exports 解析，不会再看顶层的 types。你只在 "." 里写了 import 和 require，没有写 types，所以 TS 在“遵守 exports”的情况下找不到声明文件。

##  样式引入报警告

引入样式

```js
import 'zy-component-lib/dist/index.css'
```

```json
{
  "name": "zy-component-lib",
  "version": "0.0.7",
  "type": "module",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.es.js",
  "types": "./dist/types/index.d.ts",
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/index.es.js",
      "require": "./dist/index.cjs.js"
    },
    "./styles": "./dist/index.css",
    "./dist/index.css": {
      "default": "./dist/index.css"
    }
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build --config ./config/vite.config.prod.ts",
    "preview": "vite preview"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "dependencies": {
    "vue": "^3.5.22",
    "zy-component-lib": "link:../../../Library/pnpm/global/5/node_modules/zy-component-lib"
  },
  "devDependencies": {
    "@types/node": "^24.6.0",
    "@vitejs/plugin-vue": "^6.0.1",
    "@vue/tsconfig": "^0.8.1",
    "typescript": "~5.9.3",
    "vite": "^7.1.7",
    "vite-plugin-dts": "^4.5.4",
    "vue-tsc": "^3.1.0"
  }
}

```