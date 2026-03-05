import { defineRecipe } from '@chakra-ui/react'

export const headingRecipe = defineRecipe({
  base: {
    fontWeight: 'bold',
    display: 'block',
    width: 'fit-content',
    background: 'font.primary',
    backgroundClip: 'text',
    color: 'transparent',
    letterSpacing: '-0.04rem',
    textWrap: 'balance',
  },
  variants: {
    variant: {
      secondary: {
        background: 'font.secondary',
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
      // gradient.sand from tokens (gradients.button.sand: from #E5D3BE, to #E6C6A0)
      sand: {
        background: 'linear-gradient(to bottom right, #E5D3BE, #E6C6A0)',
        backgroundClip: 'text',
        color: 'transparent',
      },
      // gradients.text.heading from semantic tokens
      gradient: {
        background: 'linear-gradient(to left, #707883, #2D4C7E)',
        backgroundClip: 'text',
        color: 'transparent',
      },
      gold: {
        background: 'font.gold',
        backgroundClip: 'text',
        color: 'transparent',
      },
      accordionHeading: {
        background: 'font.accordionHeading',
        backgroundClip: 'text',
        color: 'transparent',
        fontSize: '1.25rem',
        textAlign: 'left',
      },
    },
    size: {
      'h1-hero': {
        fontSize: { base: '3rem', md: '4rem' },
        lineHeight: { base: '3.5rem', md: '4.5rem' },
        letterSpacing: '-1.25px',
        mb: '8',
      },
      h1: {
        fontSize: { base: '3rem', md: '4rem' },
        lineHeight: { base: '3.25rem', md: '4.25rem' },
        letterSpacing: '-1.25px',
      },
      h2: {
        fontSize: { base: '2rem', md: '3rem' },
        lineHeight: { base: '2.25rem', md: '3.5rem' },
      },
      h3: {
        fontSize: { base: '1.5rem', md: '2rem' },
        lineHeight: { base: '1.75rem', md: '2.25rem' },
      },
      h4: {
        fontSize: { base: '1.25rem', md: '1.5rem' },
        lineHeight: { base: '1.5rem', md: '2rem' },
      },
      h5: {
        fontSize: { base: '1.0625rem', md: '1.25rem' },
        lineHeight: { base: '1.375rem', md: '1.5rem' },
      },
      h6: {
        fontSize: { base: '1rem', md: '1.0625rem' },
        lineHeight: { base: '1.25rem', md: '1.375rem' },
      },
    },
  },
})
