import type { App, Plugin, Component } from "vue"
export const withInstall = <T extends Component>(comp: T) => {
  const c = comp as any
  c.install = function (app: App) {
    console.log("name", c.name)
    app.component(c.name, comp)
  }
  return comp as T & Plugin
}
