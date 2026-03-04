import type { App } from "vue"
import ZyButton from "./button"

const components = [ZyButton]

// 用于部分引入
export { ZyButton }

// 用于全量引入
const ZyComponentLib: { install: (app: App) => void } = {
  install(app: App) {
    components.forEach((c) => app.use(c))
  }
}


export default ZyComponentLib


export {default as ZyElementResolver }  from "./utils/resolver"
