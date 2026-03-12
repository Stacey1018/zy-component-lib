export default function ZyElementResolver() {
  return {
    type: "component" as const,
    resolve: (componentName: string) => {
      console.log('componentName', componentName)
      // where `componentName` is always CapitalCase
      if (componentName.startsWith("Zy")) {
        const partialName = componentName.slice(2) // 去掉前缀 Zy
        const dirName = partialName.toLowerCase()  // 目录采用小写
        return {
          name: componentName,
          from: "zy-component-lib",
          sideEffects: `zy-component-lib/dist/${dirName}/style/index`,
        }
      }
    },
  }
}
