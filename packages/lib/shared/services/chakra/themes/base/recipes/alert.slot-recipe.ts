import { defineSlotRecipe } from '@chakra-ui/react'

export const alertSlotRecipe = defineSlotRecipe({
  slots: ['root', 'indicator', 'title', 'description', 'spinner'],
  base: {
    indicator: {
      color: 'font.dark',
      alignSelf: 'start',
    },
    root: {
      rounded: 'md',
      alignItems: 'center',
      "&[data-status='info']": {
        background: 'var(--chakra-colors-purple-200)',
        _dark: {
          backgroundColor: 'var(--chakra-colors-purple-300)',
        },
      },
      "&[data-status='warning']": {
        background: 'var(--chakra-colors-orange-200)',
        _dark: {
          background: 'var(--chakra-colors-orange-300)',
        },
      },
      "&[data-status='success']": {
        backgroundColor: 'var(--chakra-colors-green-300)',
        _dark: {
          backgroundColor: 'var(--chakra-colors-green-400)',
        },
      },
      "&[data-status='error']": {
        backgroundColor: 'var(--chakra-colors-red-300)',
        _dark: {
          backgroundColor: 'var(--chakra-colors-red-400)',
        },
      },
    },
    title: {
      letterSpacing: '-0.35px',
      fontSize: { base: 'sm', md: 'md' },
      lineHeight: '1.3',
      color: '#000',
      mr: '0',
      pb: 'xxs',
      textWrap: 'pretty',
    },
    description: {
      letterSpacing: '-0.25px',
      fontWeight: 'medium',
      color: '#000',
      lineHeight: '1.2',
      textWrap: 'pretty',
    },
  },
  variants: {
    variant: {
      WideOnDesktop: {
        title: {
          pb: { base: 'xxs', lg: '0' },
        },
        description: {
          fontSize: { base: 'sm', lg: 'md' },
        },
      },
    },
  },
})
