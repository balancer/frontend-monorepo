import { cardAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(cardAnatomy.keys)

const variants = {
  gradient: definePartsStyle({
    backgroundColor: 'transparent',

    container: {
      width: 'full',
      height: 'full',
      rounded: '2xl',
      backgroundColor: 'transparent',
      backgroundImage: `radial-gradient(
            farthest-corner at 80px 0px,
            rgba(235, 220, 204, 0.3) 0%,
            rgba(255, 255, 255, 0.0) 100%
          )`,
      _dark: {
        backgroundImage: `radial-gradient(
          farthest-corner at 80px 0px,
          rgba(180, 189, 200, 0.1) 0%,
          rgba(255, 255, 255, 0.0) 100%
        )`,
      },
    },
  }),
}

export const cardTheme = defineMultiStyleConfig({ variants })
