import { defineSlotRecipe } from '@chakra-ui/react'

export const radioGroupSlotRecipe = defineSlotRecipe({
  slots: ['root', 'item', 'itemControl', 'itemText', 'indicator'],
  base: {
    itemControl: {
      border: '1px solid',
      bg: 'background.level0',
      borderColor: 'input.borderDefault',
      shadow: 'input.innerBase',
      _checked: {
        bg: 'background.highlight',
        borderColor: 'border.highlight',
        _hover: {
          bg: 'background.highlight',
          borderColor: 'border.highlight',
        },
      },
      _hover: {
        boxShadow: '0 0 0 2px var(--chakra-colors-green-600)',
        _dark: {
          boxShadow: '0 0 0 2px var(--chakra-colors-green-500)',
        },
      },
      _focus: {
        boxShadow: '0 0 0 2px var(--chakra-colors-green-600)',
        _dark: {
          boxShadow: '0 0 0 2px var(--chakra-colors-green-500)',
        },
      },
      _disabled: {
        border: '1px solid',
        bg: 'background.level0',
        borderColor: 'border.base',
        opacity: '0.5',
      },
    },
    itemText: {
      color: 'font.primary',
      fontWeight: 'medium',
      letterSpacing: '-0.25px',
      lineHeight: '1.3',
      fontSize: { base: 'sm', md: 'md' },
      textWrap: 'pretty',
    },
  },
})
