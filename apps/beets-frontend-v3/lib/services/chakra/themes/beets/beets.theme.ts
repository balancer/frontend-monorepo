import { createSystem, defaultConfig } from '@chakra-ui/react'
import { colors, primaryTextColor } from './colors'
import { fonts, styles } from '@repo/lib/shared/services/chakra/themes/base/foundations'
import {
  getSemanticTokens,
  toV3SemanticTokens,
} from '@repo/lib/shared/services/chakra/themes/base/semantic-tokens'
import { getBeetsTokens } from './tokens'
import { wrapTokenValues } from '@repo/lib/shared/services/chakra/theme-helpers'

const tokens = getBeetsTokens(colors, primaryTextColor)

// Apply beets overrides to the raw v2-format tokens before v3 transformation
const rawSemanticTokens = getSemanticTokens(tokens, colors)
rawSemanticTokens.colors.font.dark = '#111111'
rawSemanticTokens.colors.font.light = '#FFFFFF'
rawSemanticTokens.colors.grayText._dark = '#BBBBBB'

const semanticTokens = toV3SemanticTokens(rawSemanticTokens)

export const theme = createSystem(defaultConfig, {
  theme: {
    tokens: {
      fonts: {
        heading: { value: fonts.heading },
        body: { value: fonts.body },
      },
      colors: wrapTokenValues(colors),
    },
    semanticTokens,
  },
  globalCss: {
    ...styles.global,
    body: {
      background: 'linear-gradient(90deg, #111111 0%, #333333 100%)',
    },
  },
})
