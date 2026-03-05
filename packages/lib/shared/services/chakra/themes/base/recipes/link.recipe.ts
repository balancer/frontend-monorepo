import { defineRecipe } from '@chakra-ui/react'

export const linkRecipe = defineRecipe({
  base: {
    color: 'font.link',
    fontSize: ['sm', 'md'],
    fontWeight: 'medium',
    transition: 'all 0.3s ease-in-out',
    _hover: {
      color: 'font.linkHover',
    },
  },
  variants: {
    variant: {
      nav: {
        color: 'font.primary',
        fontSize: ['sm', 'md'],
        transition: 'all 0.3s ease-in-out',
        _hover: {
          color: 'font.link',
          textDecoration: 'none',
        },
      },
    },
  },
})
