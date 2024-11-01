import { ThemeTypings, extendTheme } from '@chakra-ui/react'
import { colors, primaryTextColor } from './colors'
import { getTokens } from '@repo/lib/shared/services/chakra/themes/base/tokens'
import { getComponents } from '@repo/lib/shared/services/chakra/themes/base/components'
import { config, fonts, styles } from '@repo/lib/shared/services/chakra/themes/base/foundations'
import { getSemanticTokens } from '@repo/lib/shared/services/chakra/themes/base/semantic-tokens'
import { proseTheme } from '@repo/lib/shared/services/chakra/themes/base/prose'

const tokens = getTokens(colors, primaryTextColor)
const components = getComponents(tokens, primaryTextColor)
const semanticTokens = getSemanticTokens(tokens, colors)

export const balTheme = {
  config,
  fonts,
  styles,
  colors,
  semanticTokens,
  components,
}

export const theme = extendTheme(balTheme, proseTheme) as ThemeTypings
