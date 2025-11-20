import type { App } from "vue"
import HlButton from "./button"

const components = [HlButton]

export { HlButton }

export default {
  install(app: App) {
    components.forEach((c) => app.use(c))
  },
}
