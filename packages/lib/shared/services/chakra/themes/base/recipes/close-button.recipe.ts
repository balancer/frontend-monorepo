import { defineRecipe } from '@chakra-ui/react'

export const closeButtonRecipe = defineRecipe({
  variants: {
    variant: {
      softWarning: {
        bg: 'hsla(0, 0%, 100%, 0.5)',
        borderRadius: 'full',
      },
    },
  },
})
