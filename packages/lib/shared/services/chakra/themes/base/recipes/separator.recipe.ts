import { defineRecipe } from '@chakra-ui/react'

export const separatorRecipe = defineRecipe({
  base: {
    display: 'block',
    borderColor: 'border.divider',
    boxShadow: '0px 1px 0px 0px rgba(255, 255, 255, 1)',
    _dark: {
      boxShadow: '0px 1px 0px 0px rgba(255, 255, 255, 0.15)',
    },
  },
  variants: {
    variant: {
      solid: { borderStyle: 'solid' },
      dashed: { borderStyle: 'dashed' },
      dotted: { borderStyle: 'dotted' },
    },
    orientation: {
      vertical: { borderInlineStartWidth: 'var(--separator-thickness)', height: '100%' },
      horizontal: { borderTopWidth: 'var(--separator-thickness)', width: '100%' },
    },
    size: {
      xs: { '--separator-thickness': '0.5px' },
      sm: { '--separator-thickness': '1px' },
      md: { '--separator-thickness': '2px' },
      lg: { '--separator-thickness': '3px' },
    },
  },
  defaultVariants: {
    size: 'sm',
    variant: 'solid',
    orientation: 'horizontal',
  },
})
