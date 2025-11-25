# vue组件库

先写一个最基础的组件库
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


## 