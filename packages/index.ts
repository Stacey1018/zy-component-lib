import type { App } from "vue"
import ZyButton from "./button"

const components = [ZyButton]

export { ZyButton }

const ZyComponentLib: { install: (app: App) => void } = {
  install(app: App) {
    components.forEach((c) => app.use(c))
  }
}


export default ZyComponentLib

// export default {
//   install(app: App) {
//     components.forEach((c) => app.use(c))
//   },
// }
