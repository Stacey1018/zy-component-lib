import * as sass from "sass"
import fs from "fs"
import path from "path"
import fg from "fast-glob"

const themeDir = path.resolve("packages/theme")
const outDir = path.resolve("dist/theme")

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

const files = fg.sync("*.scss", {
  cwd: themeDir,
})

files.forEach((file) => {
  const result = sass.compile(path.join(themeDir, file))

  const cssFile = file.replace(".scss", ".css")

  fs.writeFileSync(path.join(outDir, cssFile), result.css)
})

console.log("theme build success")