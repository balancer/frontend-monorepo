import { defineRecipe } from '@chakra-ui/react'

export const tooltipRecipe = defineRecipe({
  base: {
    letterSpacing: '-0.25px',
    lineHeight: 'short',
    p: 'sm',
    textWrap: 'pretty',
  },
})
