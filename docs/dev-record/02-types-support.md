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
