import { defineSlotRecipe } from '@chakra-ui/react'

export const nativeSelectSlotRecipe = defineSlotRecipe({
  slots: ['root', 'field', 'indicator'],
  base: {
    field: {
      background: 'background.level1',
      fontWeight: 'bold',
      color: 'font.primary',
      shadow: 'md',
      border: '0px solid transparent',
      borderColor: 'transparent',
      outline: 'none',
    },
    indicator: {
      color: 'font.link',
    },
  },
  variants: {
    variant: {
      secondary: {
        field: {
          background: 'background.button.secondary',
          py: 'sm',
          fontSize: 'md',
          fontWeight: 'bold',
          pl: '2',
          pr: '1',
        },
      },
    },
  },
})
