import { defineSlotRecipe } from '@chakra-ui/react'

export const accordionSlotRecipe = defineSlotRecipe({
  slots: ['root', 'item', 'itemTrigger', 'itemContent', 'itemIndicator'],
  variants: {
    variant: {
      gradient: {
        itemIndicator: {
          color: 'brown.300',
        },
        itemContent: {
          px: '0',
          py: '6',
        },
        itemTrigger: {
          px: '5',
          py: '6',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          rounded: 'lg',
          borderWidth: 0,
          border: 'none',
          background: 'background.level1',
        },
        item: {
          border: 'none',
          borderWidth: 0,
          mb: '4',
        },
        root: {
          border: 'none',
        },
      },
      button: {
        itemIndicator: {
          color: 'grayText',
        },
        itemTrigger: {
          color: 'grayText',
          rounded: 'md',
        },
        itemContent: {
          borderTop: '1px solid',
          borderColor: 'border.base',
        },
        item: {
          border: 'none',
          borderWidth: 0,
          background: 'background.level1',
          shadow: 'md',
          rounded: 'md',
        },
        root: {
          border: 'none',
          borderWidth: 0,
          background: 'background.level1',
          rounded: 'sm',
        },
      },
      incentives: {
        root: {
          width: 'full',
          background: 'background.level2',
          rounded: 'lg',
          shadow: 'xl',
        },
        item: {
          width: 'full',
        },
        itemContent: {
          width: 'full',
        },
        itemIndicator: {
          color: 'orange.500',
          _dark: {
            color: 'green.500',
          },
        },
        itemTrigger: {
          width: 'full',
          borderTopWidth: 0,
          borderBottomWidth: 0,
          backgroundColor: 'background.level2',
          p: '3',
          rounded: 'lg',
        },
      },
    },
  },
})
