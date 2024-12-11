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

components.Button.variants.tertiary.background = 'background.button.primary'
components.Button.variants.tertiary._active.background = 'background.button.primary'
components.Button.variants.tertiary.color = 'font.dark'

components.Card.baseStyle.container.background = 'rgba(145,226,193,0.07)'
components.Card.baseStyle.container.shadow = 'none'

export const beetsTheme = {
  config,
  fonts,
  styles,
  colors,
  semanticTokens,
  components,
}

export const theme = extendTheme(beetsTheme, proseTheme) as ThemeTypings
