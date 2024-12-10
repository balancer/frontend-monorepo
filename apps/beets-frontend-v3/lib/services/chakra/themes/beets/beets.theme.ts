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

export const beetsTheme = {
  config,
  fonts,
  styles,
  colors,
  semanticTokens,
  components,
}

export const theme = extendTheme(beetsTheme, proseTheme) as ThemeTypings
