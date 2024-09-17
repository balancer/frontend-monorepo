import { colors as baseColors } from '../base/colors'

export const colors = {
  ...baseColors,
  base: {
    light: '#E6F9C4',
    hslLight: '103, 49%, 71%',
    dark: 'hsla(103, 100%, 6%,1)',
    hslDark: '103, 100%, 6%',
  },
}

export const primaryTextColor = `linear-gradient(45deg, ${colors.gray['700']} 0%, ${colors.gray['500']} 100%)`
