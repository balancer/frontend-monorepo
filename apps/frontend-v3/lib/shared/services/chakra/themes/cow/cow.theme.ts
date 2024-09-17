import { ThemeTypings, extendTheme } from '@chakra-ui/react'
import { colors, primaryTextColor } from './colors'
import { getComponents } from '../base/components'
import { config, fonts, styles } from '../base/foundations'
import { proseTheme } from '../base/prose'
import { getSemanticTokens } from '../base/semantic-tokens'
import { getCowTokens } from './tokens'

const tokens = getCowTokens(colors, primaryTextColor)
const components = getComponents(tokens, primaryTextColor)
const semanticTokens = getSemanticTokens(tokens, colors)

export const cowTheme = {
  config,
  fonts,
  styles,
  colors,
  semanticTokens,
  components,
}

export const theme = extendTheme(cowTheme, proseTheme) as ThemeTypings
