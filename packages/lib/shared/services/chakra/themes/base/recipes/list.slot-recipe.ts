import { defineSlotRecipe } from '@chakra-ui/react'

export const listSlotRecipe = defineSlotRecipe({
  slots: ['root', 'item'],
  base: {
    item: {
      color: 'font.primary',
      fontWeight: 'medium',
      letterSpacing: '-0.25px',
      lineHeight: '1.3',
      fontSize: { base: 'sm', md: 'md' },
      textWrap: 'pretty',
      pb: 'xs',
    },
  },
  variants: {
    variant: {
      secondary: {
        item: {
          color: 'font.secondary',
        },
      },
      link: {
        item: {
          color: 'font.link',
          '&::marker': {
            color: 'font.link',
          },
        },
      },
    },
  },
})
