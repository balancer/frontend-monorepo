import { ThemeTypings, extendTheme } from '@chakra-ui/react'
import { colors, primaryTextColor } from './colors'
import { getComponents } from '@repo/lib/shared/services/chakra/themes/base/components'
import { config, fonts, styles } from '@repo/lib/shared/services/chakra/themes/base/foundations'
import { getSemanticTokens } from '@repo/lib/shared/services/chakra/themes/base/semantic-tokens'
import { proseTheme } from '@repo/lib/shared/services/chakra/themes/base/prose'
import { getBeetsTokens } from './tokens'

const tokens = getBeetsTokens(colors, primaryTextColor)
const components = getComponents(tokens, primaryTextColor)
const semanticTokens = getSemanticTokens(tokens, colors)

semanticTokens.colors.font.dark = '#111111'
semanticTokens.colors.font.light = '#FFFFFF'
semanticTokens.colors.grayText._dark = '#BBBBBB'


export const beetsTheme = {
  config,
  fonts,
  styles: {
    global: {
      ...styles.global,
      body: {
        background: 'linear-gradient(90deg, #111111 0%, #333333 100%)',
      },
    }
  },
  colors,
  semanticTokens,
  components,
}

export const theme = extendTheme(beetsTheme, proseTheme) as ThemeTypings
