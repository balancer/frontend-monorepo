import { defineSlotRecipe } from '@chakra-ui/react'

export const tagSlotRecipe = defineSlotRecipe({
  slots: ['root', 'label', 'closeTrigger'],
  base: {
    root: {
      background: 'background.level1',
      shadow: 'md',
      borderColor: 'border.base',
      borderWidth: '1px',
      borderRadius: 'full',
      color: 'font.primary',
      fontWeight: 'semibold',
      fontSize: '14px',
      _hover: {
        color: 'white',
      },
    },
    label: {
      userSelect: 'none',
    },
    closeTrigger: {
      color: 'font.maxContrast',
    },
  },
})
