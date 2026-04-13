const PKG_NAME = 'zy-component-lib'
const PKG_PREFIX = '@zy-component-lib'

import type { Plugin } from 'rollup'

export function ZyComponentsLibAlias(): Plugin {
  const themeChalk = 'theme'
  const sourceThemeChalk = `${PKG_PREFIX}/${themeChalk}` as const
  const bundleThemeChalk = `${PKG_NAME}/${themeChalk}` as const

  return {
    name: 'zy-components-lib-alias-plugin',
    resolveId(id) {
      if (!id.startsWith(sourceThemeChalk)) return
      return {
        id: id.replaceAll(sourceThemeChalk, bundleThemeChalk),
        external: 'absolute',
      }
    },
  }
}
