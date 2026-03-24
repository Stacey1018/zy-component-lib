import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export const projRoot = resolve(__dirname, '..', '..', '..')
export const pkgRoot = resolve(projRoot, 'packages')
export const buildRoot = resolve(projRoot)
