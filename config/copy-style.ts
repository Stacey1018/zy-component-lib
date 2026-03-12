import fs from "fs"
import path from "path"
import fg from "fast-glob"

const root = process.cwd()

// packages 目录
const packagesDir = path.resolve(root, "packages")

// dist 输出目录
const distDir = path.resolve(root, "dist")

async function copyStyle() {
  // 找到所有 style/index.ts
  const files = await fg("*/style/index.ts", {
    cwd: packagesDir,
  })

  for (const file of files) {
    const absPath = path.resolve(packagesDir, file)

    let content = fs.readFileSync(absPath, "utf-8")

    // 把 scss 改成 css
    content = content.replace(/\.scss/g, ".css")

    // 输出路径
    const outFile = path.resolve(
      distDir,
      file.replace(".ts", ".js")
    )

    // 创建目录
    fs.mkdirSync(path.dirname(outFile), { recursive: true })

    // 写入文件
    fs.writeFileSync(outFile, content)
  }

  console.log("style copied successfully")
}

copyStyle()