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

packages/button/index.ts
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



## 