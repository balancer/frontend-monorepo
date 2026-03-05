import { defineRecipe } from '@chakra-ui/react'

export const badgeRecipe = defineRecipe({
  variants: {
    variant: {
      meta: {
        background: 'background.level3',
        color: 'font.secondary',
        shadow: 'sm',
        py: 1,
        px: 2,
        textTransform: 'capitalize',
      },
    },
  },
})
