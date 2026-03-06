import { defineSlotRecipe } from '@chakra-ui/react'

export const stepsSlotRecipe = defineSlotRecipe({
  slots: [
    'root',
    'list',
    'item',
    'trigger',
    'indicator',
    'separator',
    'title',
    'description',
    'content',
    'nextTrigger',
    'prevTrigger',
    'progress',
  ],
  base: {
    title: {
      color: 'font.secondary',
      "&[data-status='active']": {
        color: 'font.primary',
        _dark: {
          color: 'font.primary',
        },
      },
    },
    indicator: {
      color: 'font.secondary',
      borderStyle: 'dashed',
      "&[data-status='active']": {
        background: 'transparent',
        borderColor: 'font.primary',
        color: 'font.primary',
        borderStyle: 'solid',
        _dark: {
          backgroundColor: 'transparent',
          borderColor: 'font.primary',
          color: 'font.primary',
        },
      },
      "&[data-status='complete']": {
        background: 'transparent',
        borderColor: 'green.500',
        border: '2px solid',
        color: 'green.500',
        _dark: {
          backgroundColor: 'transparent',
          borderColor: 'green.500',
          color: 'green.500',
        },
      },
    },
    separator: {
      "&[data-status='complete']": {
        background: 'green.500',
        _dark: {
          backgroundColor: 'green.500',
        },
      },
    },
  },
})
