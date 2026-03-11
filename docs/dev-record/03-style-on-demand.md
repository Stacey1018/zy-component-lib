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
  sideEffects?: string | string[]  // 自动引入 style
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
import { Button } from 'zy-component-lib'
import 'zy-component-lib/dist/index.css'
```

## 运行play查看是否生效
![alt text](./images/03/image.png)
可以看到样式已经自动引入了


问题，多个组件时，回导致重复引入 `import 'zy-component-lib/dist/index.css'`

## 解决方法



