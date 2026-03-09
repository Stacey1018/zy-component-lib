# vue组件库

先写一个最基础的组件库
分支： feature-basic-demo

# 基础初始化
- vite 构建

- tsconfig

- eslint / prettier

- 基础组件 Button

- 打包发布能力

- 采用单库模式

zy-component-lib
├── README.md
├── config
│   └── vite.config.prod.ts
├── index.html
├── package-lock.json
├── package.json
├── packages
│   ├── button
│   │   ├── index.ts              // 组件入口
│   │   ├── src
│   │   │   └── button.vue        // 组件button源码
│   │   └── style
│   │       └── index.scss        // 组件样式
│   ├── index.ts                  // 组件库入口
│   ├── styles
│   │   ├── index.scss
│   │   └── variables.scss
│   └── utils
│       └── withInstall.ts
├── play                          // 测试项目
│   ├── README.md
│   ├── env.d.ts
│   ├── eslint.config.ts
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── public
│   │   └── favicon.ico
│   ├── src
│   │   ├── App.vue
│   │   ├── assets
│   │   │   ├── base.css
│   │   │   ├── logo.svg
│   │   │   └── main.css
│   │   ├── components
│   │   │   ├── HelloWorld.vue
│   │   │   ├── TheWelcome.vue
│   │   │   ├── WelcomeItem.vue
│   │   │   └── icons
│   │   ├── main.ts
│   │   ├── router
│   │   │   └── index.ts
│   │   ├── stores
│   │   │   └── counter.ts
│   │   └── views
│   │       ├── AboutView.vue
│   │       └── HomeView.vue
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── pnpm-lock.yaml
├── public
│   └── vite.svg
├── src
│   ├── App.vue
│   ├── assets
│   │   └── vue.svg
│   ├── components
│   │   └── HelloWorld.vue
│   ├── main.ts
│   └── style.css
├── tree-output.txt
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts

核心要点

`vue.component`： 注册组件
`vue.use`：安装插件

`packages/button/src/button.vue`

```js
<template>
  <button :class="['zy-button', `zy-button--${type}`]" @click="handleClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'primary' | 'success' | 'warning' | 'danger'
}>()

// 这个要注意，必须加上
defineOptions({
  name: 'ZyButton',
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (e: MouseEvent) => emit('click', e)
</script>

<style lang="scss" scoped>
@use '../../styles/variables' as *;

.zy-button {
  padding: 8px 16px;
  border-radius: 6px;
  color: #fff;
  background-color: $color-primary;

  &--success { background-color: $color-success; }
  &--warning { background-color: $color-warning; }
  &--danger { background-color: $color-danger; }
}
</style>

```
packages/button/index.ts
```js
import { withInstall } from '../utils/withInstall'
import Button from './src/button.vue'
import './style/index.scss';

export const ZyButton = withInstall(Button)
export default ZyButton

```
withInstall返回一个带有install方法的对象，是为了之后做部分引入或按需引入时使用
packages/index.ts ：遍历组件进行注册，为了后续全量引入


## play 
用于测试组件库


## 包配置
配置package.json
```js
{
  "name": "zy-component-lib",                 // 包名
  "private": false,                           // false 才能发布
  "version": "0.0.1",                         // 版本号，遵循 semver
  "type": "module",                           // 适合 ESM
  "main": "./dist/zy-component-lib.cjs.js",   // CommonJS 入口  保留以兼容老工具
  "module": "/dist/zy-fe-component.es.js",    // ESModule 入口  留以兼容老 bundler
  "files": ["dist"],                          // 发布时包含的文件
  "exports": {                                // 新规范，用于精确控制包的对外接口（包括 ESM 和 CJS），是 Node 16+、Vite、Rollup 都推荐使用的
    ".": {
      "import": "./dist/zy-component-lib.es.js", // ES 模块导入时使用
      "require": "./dist/zy-component-lib.cjs.js" // CommonJS 导入时使用
    },
    "./styles": "./dist/zy-component-lib.css" // 导出样式文件
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build --config ./config/vite.config.prod.js",
    "preview": "vite preview"
  },
  "peerDependencies": {
    "vue": "^3.3.0"                     // 避免把 vue 打包进来
  },
  "dependencies": {
    "vue": "^3.5.22"
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

### 发包

> 发布过程中发现npm发布包需要配置_authToken，具体可看npm官网

查看包是否可用
```shell
npm view zy-component-lib
``` 

登录npm 
```shell
npm login
```

验证成功
```shell
npm whoami
```

查看将要发布的文件
```shell
npm pack --dry-run
```

确认版本号
```shell
npm version patch

```


发布普通包
```shell
npm publish --access public
```


### pnpm link 
- 可以测试 本地开发的组件库，无需发布到 npm
- 支持 全量和按需引入
- 支持 打包后的产物（如果你在组件库里先执行 pnpm build）
- 热更新：如果引用的是源码，可以即时看到改动

组件根目录下执行
```shell
pnpm link
```
这会把你的本地组件库注册为全局可用的链接包,让你在其他项目里可以像安装 npm 包一样使用本地开发的库，而不需要发布到 npm。

play下执行
```shell
pnpm link zy-component-lib
```
- pnpm 会在 play/node_modules 下创建一个 符号链接，指向你组件库本地目录
- play 项目里就可以像平时用 npm 安装的包一样引用 zy-component-lib
    
执行后可以看到play/package.json多了一行 `"zy-component-lib": "link:../../../../Library/pnpm/global/5/node_modules/zy-component-lib"`


### 全量引入
```js
import 'zy-component-lib/styles'
// 全量引入
import ZyComponentLib from 'zy-component-lib'

const app = createApp(App)

app.use(ZyComponentLib)
```

### 部分引入
```js
import { ZyButton } from 'zy-component-lib'

const app = createApp(App)

app.use(ZyButton)
```

效果如下
![图片](/docs/dev-record/images/1.jpg)



### 安装npm包测试
可参考项目test-zy-component，分支stage/00-initial-mvp