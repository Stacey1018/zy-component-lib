import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// import 'zy-component-lib/dist/index.css'

// 全量引入
// import ZyComponentLib from 'zy-component-lib'

// const app = createApp(App)

// app.use(ZyComponentLib)

// 部分引入
// import { ZyButton } from 'zy-component-lib'

const app = createApp(App)

// app.use(ZyButton)

app.use(createPinia())
app.use(router)

app.mount('#app')
