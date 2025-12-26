# vue组件库

先写一个最基础的组件库
分支： feature-basic-demo

当前先采用单库模式

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

### 全量导入

```js
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import ZyComponentLib from '../../packages'

const app = createApp(App)

app.use(ZyComponentLib)
app.use(createPinia())
app.use(router)

app.mount('#app')
```

### 单个导入

```js
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import {ZyButton} from "../../packages";
const app = createApp(App)

app.use(ZyButton)
app.use(createPinia())
app.use(router)
app.mount('#app')

```

效果如下
![图片](/reade-images/1.jpg)


## 