import { ThemeTypings, createSystem, defaultConfig } from '@chakra-ui/react';
import { colors, primaryTextColor } from './colors'
import { getComponents } from '@repo/lib/shared/services/chakra/themes/base/components'
import {
  fonts,
  styles,
  themeConfig } from '@repo/lib/shared/services/chakra/themes/base/foundations'
import { proseTheme } from '@repo/lib/shared/services/chakra/themes/base/prose'
import { getSemanticTokens } from '@repo/lib/shared/services/chakra/themes/base/semantic-tokens'
import { getCowTokens } from './tokens'

const tokens = getCowTokens(colors, primaryTextColor)
const components = getComponents(tokens, primaryTextColor)
const semanticTokens = getSemanticTokens(tokens, colors)

export {};

export const theme = createSystem(defaultConfig, {
  system: {
    tokens: {
      fonts,
      colors },

    semanticTokens: semanticTokens },

  components }) as ThemeTypings
