import { createSystem, defaultConfig } from '@chakra-ui/react'
import { colors, primaryTextColor } from './colors'
import { fonts, styles } from '@repo/lib/shared/services/chakra/themes/base/foundations'
import {
  getSemanticTokens,
  toV3SemanticTokens,
} from '@repo/lib/shared/services/chakra/themes/base/semantic-tokens'
import { getCowTokens } from './tokens'
import { wrapTokenValues } from '@repo/lib/shared/services/chakra/theme-helpers'
import {
  textRecipe,
  headingRecipe,
  buttonRecipe,
  linkRecipe,
  badgeRecipe,
  inputRecipe,
  cardSlotRecipe,
} from '@repo/lib/shared/services/chakra/themes/base/recipes'

const tokens = getCowTokens(colors, primaryTextColor)
const semanticTokens = toV3SemanticTokens(getSemanticTokens(tokens, colors))

export const theme = createSystem(defaultConfig, {
  conditions: {
    _dark: '.dark &, &.dark',
    _light: '.light &, &.light',
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: fonts.heading },
        body: { value: fonts.body },
      },
      colors: wrapTokenValues(colors),
    },
    semanticTokens,
    recipes: {
      text: textRecipe,
      heading: headingRecipe,
      button: buttonRecipe,
      link: linkRecipe,
      badge: badgeRecipe,
      input: inputRecipe,
    },
    slotRecipes: {
      card: cardSlotRecipe,
    },
  },
  globalCss: styles.global,
})
