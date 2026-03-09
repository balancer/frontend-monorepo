import { defineRecipe } from '@chakra-ui/react'

export const separatorRecipe = defineRecipe({
  base: {
    borderColor: 'border.divider',
    borderWidth: '1px',
    boxShadow: '0px 1px 0px 0px rgba(255, 255, 255, 1)',
    _dark: {
      boxShadow: '0px 1px 0px 0px rgba(255, 255, 255, 0.15)',
    },
  },
})
