import { defineSlotRecipe } from '@chakra-ui/react'

export const drawerSlotRecipe = defineSlotRecipe({
  slots: ['backdrop', 'positioner', 'content', 'header', 'body', 'footer', 'closeTrigger'],
  base: {
    closeTrigger: {
      top: '3',
      color: 'font.primary',
      rounded: 'full',
    },
    header: {
      color: 'font.primary',
    },
    backdrop: {
      bg: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(4px)',
      _dark: {
        bg: 'rgba(0,0,0,0.7)',
      },
    },
  },
})
