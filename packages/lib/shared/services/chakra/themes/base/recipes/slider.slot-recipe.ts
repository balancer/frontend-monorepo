import { defineSlotRecipe } from '@chakra-ui/react'

export const sliderSlotRecipe = defineSlotRecipe({
  slots: ['root', 'track', 'range', 'thumb', 'markerGroup', 'marker', 'label', 'valueText'],
  base: {
    range: {
      bg: 'background.highlight',
    },
    thumb: {
      borderColor: 'background.highlight',
      boxShadow: 'md',
    },
  },
  variants: {
    variant: {
      lock: {
        range: {
          height: '5px',
        },
        thumb: {
          height: '16px',
          width: '16px',
        },
        track: {
          _dark: {
            bg: '#282D34',
          },
          _light: {
            bg: '#D7D2CB',
          },
          height: '5px',
        },
      },
    },
  },
})
