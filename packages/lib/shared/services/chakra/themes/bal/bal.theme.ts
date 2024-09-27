import { ThemeTypings, extendTheme } from '@chakra-ui/react'
import { colors, primaryTextColor } from './colors'
import { getTokens } from '../base/tokens'
import { getComponents } from '../base/components'
import { config, fonts, styles } from '../base/foundations'
import { getSemanticTokens } from '../base/semantic-tokens'
import { proseTheme } from '../base/prose'

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
