import { defineSlotRecipe } from '@chakra-ui/react'

export const switchSlotRecipe = defineSlotRecipe({
  slots: ['root', 'control', 'thumb', 'label'],
  base: {
    control: {
      bg: 'font.secondary',
      _checked: {
        bg: 'font.highlight',
      },
    },
  },
})
