import { defineSlotRecipe } from '@chakra-ui/react'

export const checkboxSlotRecipe = defineSlotRecipe({
  slots: ['root', 'control', 'label', 'indicator'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      cursor: 'pointer',
      py: '1',
    },
    control: {
      flexShrink: 0,
      w: '4',
      h: '4',
      rounded: 'sm',
      border: 'none',
      bg: 'background.level0',
      _checked: {
        bg: 'background.highlight !important',
      },
      _hover: {
        boxShadow: '0 0 0 2px var(--chakra-colors-green-600)',
        _dark: {
          boxShadow: '0 0 0 2px var(--chakra-colors-green-500)',
        },
      },
      _focus: {
        boxShadow: '0 0 0 2px var(--chakra-colors-green-600)',
        _dark: {
          boxShadow: '0 0 0 2px var(--chakra-colors-green-500)',
        },
      },
      _disabled: {
        border: '1px solid',
        bg: 'background.level3',
        borderColor: 'border.base',
        opacity: '0.5',
      },
    },
    indicator: {
      bg: 'transparent',
      color: 'white',
      _dark: {
        color: 'black',
      },
      w: 'full',
      h: 'full',
    },
    label: {
      color: 'font.primary',
      fontWeight: 'medium',
      letterSpacing: '-0.25px',
      lineHeight: '1.3',
      fontSize: { base: 'sm', md: 'md' },
      textWrap: 'pretty',
    },
  },
  variants: {
    variant: {
      solid: {
        control: {
          bg: 'background.level0',
          border: 'none',
          _checked: {
            bg: 'background.highlight !important',
          },
        },
      },
      subtle: {
        control: {
          bg: 'background.level0',
          border: 'none',
          _checked: {
            bg: 'background.highlight !important',
          },
        },
      },
      outline: {
        control: {
          bg: 'background.level0',
          border: 'none',
          _checked: {
            bg: 'background.highlight !important',
          },
        },
      },
    },
  },
})
