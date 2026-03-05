import { defineSlotRecipe } from '@chakra-ui/react'

export const cardSlotRecipe = defineSlotRecipe({
  slots: ['root', 'header', 'body', 'footer'],
  base: {
    root: {
      background: 'background.level2',
      rounded: 'lg',
      borderWidth: '1px',
      borderColor: 'transparent',
      shadow: 'xl',
      width: 'full',
      padding: { base: 'sm', md: 'md' },
    },
    header: {
      padding: '0',
      paddingBottom: 'md',
      fontSize: '2xl',
      fontWeight: 'bold',
      color: 'font.primary',
      letterSpacing: '-0.04rem',
    },
    body: {
      padding: '0',
    },
    footer: {
      padding: '0',
      paddingTop: 'md',
    },
  },
  variants: {
    variant: {
      subSection: {
        root: {
          background: 'background.level3',
          borderWidth: '1px',
          borderColor: 'border.base',
          shadow: 'sm',
          padding: 'ms',
          width: 'full',
          rounded: 'md',
        },
        header: {
          padding: '0',
          paddingBottom: 'md',
          color: 'font.primary',
          fontWeight: 'bold',
          fontSize: 'sm',
        },
      },
      modalSubSection: {
        root: {
          background: 'background.level2',
          borderWidth: '1px',
          borderColor: 'border.base',
          shadow: 'sm',
          padding: 'ms',
          width: 'full',
          rounded: 'md',
        },
        header: {
          padding: '0',
          paddingBottom: 'md',
          color: 'font.primary',
          fontWeight: 'bold',
          fontSize: 'sm',
        },
      },
      level0: { root: { background: 'background.level0' } },
      level1: { root: { background: 'background.level1' } },
      level2: { root: { background: 'background.level2' } },
      level3: { root: { background: 'background.level3' } },
      level4: { root: { background: 'background.level4' } },
      gradient: {
        root: {
          width: 'full',
          height: 'full',
          rounded: '2xl',
          _light: {
            backgroundColor: 'transparent',
            backgroundImage: `radial-gradient(farthest-corner at 80px 0px, rgba(235, 220, 204, 0.3) 0%, rgba(255, 255, 255, 0.0) 100%)`,
          },
          _dark: {
            backgroundColor: 'transparent',
            backgroundImage: `radial-gradient(farthest-corner at 80px 0px, rgba(180, 189, 200, 0.1) 0%, rgba(255, 255, 255, 0.0) 100%)`,
          },
        },
      },
    },
  },
})
