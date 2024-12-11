/* eslint-disable max-len */
import { colors as baseColors } from '@repo/lib/shared/services/chakra/themes/base/colors'

export const colors = {
  ...baseColors,
  base: {
    light: '#E6F9C4',
    hslLight: '103, 49%, 71%',
    dark: 'linear-gradient(90deg, #111111 0%, #333333 100%)',
    hslDark: '0, 0%, 17%',
  },
}

export const primaryTextColor = `linear-gradient(45deg, ${colors.gray['700']} 0%, ${colors.gray['500']} 100%)`
