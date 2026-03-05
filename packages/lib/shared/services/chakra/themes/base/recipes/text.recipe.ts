import { defineRecipe } from '@chakra-ui/react'

export const textRecipe = defineRecipe({
  base: {
    color: 'font.primary',
    fontWeight: 'medium',
    letterSpacing: '-0.25px',
    lineHeight: '1.3',
    fontSize: ['sm', 'md'],
    textWrap: 'pretty',
  },
  variants: {
    variant: {
      secondary: {
        color: 'font.secondary',
      },
      primaryGradient: {
        background: 'font.primaryGradient',
        backgroundClip: 'text',
        color: 'transparent',
      },
      secondaryGradient: {
        background: 'font.secondaryGradient',
        backgroundClip: 'text',
        color: 'transparent',
      },
      special: {
        background: 'font.special',
        backgroundClip: 'text',
        color: 'transparent',
      },
      specialSecondary: {
        background: 'font.specialSecondary',
        backgroundClip: 'text',
        color: 'transparent',
      },
      eyebrow: {
        textTransform: 'uppercase',
        fontSize: 'xs',
        fontWeight: 'semibold',
        letterSpacing: '1px',
        width: 'fit-content',
      },
    },
  },
})
