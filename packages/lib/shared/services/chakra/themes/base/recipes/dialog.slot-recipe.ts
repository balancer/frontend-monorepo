import { defineSlotRecipe } from '@chakra-ui/react'

export const dialogSlotRecipe = defineSlotRecipe({
  slots: ['backdrop', 'positioner', 'content', 'header', 'body', 'footer', 'closeTrigger'],
  base: {
    content: {
      background: 'background.level0',
      borderRadius: '2xl',
      paddingBottom: 'xs',
      shadow: '2xl',
      maxWidth: '480px',
    },
    closeTrigger: {
      top: '3.5',
      right: '3.5',
      color: 'font.primary',
      rounded: 'full',
      background: 'background.level2',
      shadow: '2xl',
    },
    header: {
      color: 'font.primary',
      letterSpacing: '-0.04rem',
      paddingBottom: 'ms',
      paddingX: '5',
      paddingRight: 'xl',
    },
    body: {
      paddingTop: 'xxs',
      paddingBottom: '0',
      paddingX: '5',
    },
    footer: {
      paddingX: '5',
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
