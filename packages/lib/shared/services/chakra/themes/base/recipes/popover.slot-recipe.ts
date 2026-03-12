import { defineSlotRecipe } from '@chakra-ui/react'

export const popoverSlotRecipe = defineSlotRecipe({
  slots: ['arrow', 'content', 'title', 'body', 'footer', 'closeTrigger', 'positioner'],
  base: {
    content: {
      bg: 'background.level3',
      boxShadow: '3xl !important',
      border: '1px solid',
      borderColor: 'border.divider',
      maxH: 'none',
      _open: {
        animationName: 'fade-in',
        animationDuration: '0.15s',
        animationTimingFunction: 'ease-out',
      },
      _closed: {
        animationName: 'fade-out',
        animationDuration: '0.1s',
        animationTimingFunction: 'ease-in',
      },
    },
    arrow: {
      '--arrow-background': 'colors.background.level3',
      borderColor: 'border.base',
    },
    closeTrigger: {
      color: 'font.primary',
      rounded: 'full',
    },
    footer: {
      borderTopWidth: '0',
    },
    title: {
      borderBottomWidth: '1px',
      borderBottomColor: 'border.divider',
      boxShadow: '0px 1px 0px 0px rgba(255, 255, 255, 1)',
      _dark: {
        boxShadow: '0px 1px 0px 0px rgba(255, 255, 255, 0.15)',
      },
      paddingInlineStart: 0,
      paddingInlineEnd: 0,
      marginInline: 3,
    },
    body: {
      textWrap: 'pretty',
    },
  },
  variants: {
    variant: {
      tooltip: {
        content: {
          background: 'background.level2',
          borderColor: 'transparent',
          color: 'grayText',
          fontWeight: 'bold',
          shadow: '3xl',
          textWrap: 'pretty',
        },
        body: {
          background: 'background.level2',
          color: 'grayText',
          px: 'sm',
          py: 'xs',
          rounded: 'md',
        },
      },
      multiSelect: {
        content: {
          background: 'background.level2',
          border: 'none',
          borderColor: 'transparent',
          color: 'font.primary',
        },
        body: {
          background: 'background.level2',
          border: 'none',
          borderColor: 'transparent',
          rounded: 'md',
          shadow: '3xl',
        },
      },
    },
  },
})
