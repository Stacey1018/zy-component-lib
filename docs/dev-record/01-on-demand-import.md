# 组件按需加载

## 目标
实现类似element-plus的按需导入
![alt text](./images/2.png)

配置后使用示例
```vue
<template>
  <div>
    <el-table />
  </div>
</template>

<script>
import { ElTable } from 'element-plus'
import 'element-plus/es/components/table/style/css'

export default {
  name: 'App',
  components: {
    ElTable
  }
}
</script>

```
等同于
```vue
<template>
  <div>
    <el-table />
  </div>
</template>

<script>
import { ElTable } from 'element-plus'
import 'element-plus/es/components/table/style/css'

export default {
  name: 'App',
  components: {
    ElTable
  }
}
</script>

```

## unplugin-vue-components
[unplugin-vue-components](https://markdown.com.cn)为element-plus提供了`ElementPlusResolver`,同时支持我们自己编写resolver
我们只要实现一个供自己组件库使用的resolver就可以了

## 实现

官方提供的实例代码
```js
Components({
  resolvers: [
    // example of importing Vant
    (componentName) => {
      // where `componentName` is always CapitalCase
      if (componentName.startsWith('Van'))
        return { name: componentName.slice(2), from: 'zy' }
    },
  ],
})
```


##