import { createSystem, defaultConfig } from '@chakra-ui/react'
import { colors, primaryTextColor } from './colors'
import { getTokens } from '@repo/lib/shared/services/chakra/themes/base/tokens'
import { fonts, styles } from '@repo/lib/shared/services/chakra/themes/base/foundations'
import {
  getSemanticTokens,
  toV3SemanticTokens,
} from '@repo/lib/shared/services/chakra/themes/base/semantic-tokens'
import { wrapTokenValues } from '@repo/lib/shared/services/chakra/theme-helpers'
import {
  textRecipe,
  headingRecipe,
  buttonRecipe,
  linkRecipe,
  badgeRecipe,
  inputRecipe,
  textareaRecipe,
  tooltipRecipe,
  iconButtonRecipe,
  closeButtonRecipe,
  cardSlotRecipe,
  accordionSlotRecipe,
  dialogSlotRecipe,
  drawerSlotRecipe,
  popoverSlotRecipe,
  tagSlotRecipe,
  radioGroupSlotRecipe,
  checkboxSlotRecipe,
  sliderSlotRecipe,
  switchSlotRecipe,
  alertSlotRecipe,
  stepsSlotRecipe,
  listSlotRecipe,
  nativeSelectSlotRecipe,
  numberInputSlotRecipe,
  separatorRecipe,
} from '@repo/lib/shared/services/chakra/themes/base/recipes'

const tokens = getTokens(colors, primaryTextColor)
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
      textarea: textareaRecipe,
      tooltip: tooltipRecipe,
      iconButton: iconButtonRecipe,
      closeButton: closeButtonRecipe,
      separator: separatorRecipe,
    },
    slotRecipes: {
      card: cardSlotRecipe,
      accordion: accordionSlotRecipe,
      dialog: dialogSlotRecipe,
      drawer: drawerSlotRecipe,
      popover: popoverSlotRecipe,
      tag: tagSlotRecipe,
      radioGroup: radioGroupSlotRecipe,
      checkbox: checkboxSlotRecipe,
      slider: sliderSlotRecipe,
      switch: switchSlotRecipe,
      alert: alertSlotRecipe,
      steps: stepsSlotRecipe,
      list: listSlotRecipe,
      nativeSelect: nativeSelectSlotRecipe,
      numberInput: numberInputSlotRecipe,
    },
  },
  globalCss: styles.global,
})

export default theme
