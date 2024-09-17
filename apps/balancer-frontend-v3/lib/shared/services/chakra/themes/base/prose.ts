import { withProse } from '@nikolovlazar/chakra-ui-prose'

export const proseTheme = withProse({
  baseStyle: {
    '.subsection': {
      marginBottom: '20',
    },
    '.nav': {
      bg: 'background.level2',
      p: 'md',
      rounded: 'xl',
      shadow: 'lg',
    },
    '.nav h2': {
      fontSize: '1.5rem',
      p: '0',
      m: '0',
    },
    '.nav h3': {
      fontSize: '1.125rem',
      p: '0',
      m: '0',
    },
    '.nav h6': {
      p: '0',
      m: '0',
      color: 'font.primary',
    },
    '.nav ul': {
      mb: '16px',
    },
    '.nav li': {
      my: '4px',
      _hover: {
        color: 'font.highlight',
      },
    },
    '.nav li a': {
      _hover: {
        color: 'font.highlight',
      },
    },
    '.nav a': {
      color: 'font.primary',
      _hover: {
        color: 'font.highlight',
      },
    },
    'h4 + p': {
      marginTop: '4',
    },
    p: {
      fontWeight: 'medium',
      color: 'font.primary',
    },
    li: {
      color: 'font.primary',
      fontWeight: 'medium',
    },
    h1: {
      fontWeight: 'bold',
      letterSpacing: '-0.04rem',
      marginBottom: '1.5rem',
      color: 'font.maxContrast',
      fontSize: { base: '2.5rem', md: '3rem' },
      lineHeight: '1.125',
    },
    h2: {
      fontWeight: 'bold',
      letterSpacing: '-0.04rem',
      marginBottom: { base: '8', sm: '8' },
      color: 'font.maxContrast',
      fontSize: { base: '2rem', md: '2.5rem' },
      lineHeight: { base: '2.25rem', md: '2.75rem' },
    },
    h3: {
      fontWeight: 'bold',
      letterSpacing: '-0.02rem',
      marginBottom: { base: '8', sm: '8' },
      color: 'font.maxContrast',
      fontSize: { base: '1.5rem', md: '2rem' },
      lineHeight: { base: '1.75rem', md: '2.25rem' },
    },
    h4: {
      fontWeight: 'bold',
      letterSpacing: '-0.02rem',
      color: 'font.maxContrast',
      fontSize: { base: '1.25rem', md: '1.5rem' },
      lineHeight: { base: '1.5rem', md: '1.75rem' },
    },
    h5: {
      fontWeight: 'bold',
      letterSpacing: '-0.01rem',
      color: 'font.maxContrast',
      marginTop: { base: '10', sm: '10' },
      marginBottom: { base: '6', sm: '6' },
      fontSize: { base: '1.0625rem', md: '1.25rem' },
      lineHeight: { base: '1.375rem', md: '1.5rem' },
    },
    h6: {
      fontWeight: 'bold',
      letterSpacing: '-0.01rem',
      color: 'font.maxContrast',
      marginBottom: { base: '6', sm: '6' },
      fontSize: { base: '1rem', md: '1.0625rem' },
      lineHeight: { base: '1.25rem', md: '1.375rem' },
    },
    a: {
      color: 'font.link',
      _hover: {
        color: 'font.highlight',
      },
    },
    Link: {
      color: 'font.link',
    },
  },
})
