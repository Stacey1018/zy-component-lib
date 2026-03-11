export default function ZyElementResolver() {
  return {
    type: "component" as const,
    resolve: (componentName: string) => {
      console.log('componentName', componentName)
      // where `componentName` is always CapitalCase
      if (componentName.startsWith("Zy")) return {
        name: componentName,
        from: "zy-component-lib",
        sideEffects: "zy-component-lib/dist/index.css"
      }
    },
  }
}
