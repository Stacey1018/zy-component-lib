export default function ZyUIResolver() {
  return {
    resolvers: [
      (componentName: string) => {
        // where `componentName` is always CapitalCase
        if (componentName.startsWith("Zy")) return { name: componentName.slice(3), from: "vant" }
      },
    ],
  }
}
