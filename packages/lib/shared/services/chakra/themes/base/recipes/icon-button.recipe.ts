import { defineRecipe } from '@chakra-ui/react'

export const iconButtonRecipe = defineRecipe({
  variants: {
    variant: {
      tertiary: {
        background: 'background.elevation1',
        color: 'font.button.tertiary',
        boxShadow: 'btnTertiary',
      },
    },
  },
})
