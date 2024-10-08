import tinycolor from 'tinycolor2'
import { getTokens } from '../base/tokens'

export function getCowTokens(colors: any, primaryTextColor: any) {
  const baseTokens = getTokens(colors, primaryTextColor)

  return {
    ...baseTokens,
    colors: {
      ...baseTokens.colors,
      light: {
        ...baseTokens.colors.light,
        background: {
          ...baseTokens.colors.light.background,
          level0: '#DDF7B5',
          level1: '#E6F9C4',
          level2: '#F5FDE8',
          level3: '#F9FEF1',
          level4: '#FFFFFF',
          base: '#E6F9C4',
          baseWithOpacity: 'hsla(83, 81%, 87%, 0.75)',
          special: colors.gradient.dawnLight,
          level0WithOpacity: 'rgba(213, 245, 163, 0.96)',
        },

        border: {
          ...baseTokens.colors.light.border,
          base: '#F9FEF1',
          divider: '#D4F7A1',
          subduedZen: 'hsla(88, 63%, 59%, 0.2)',
        },
        button: {
          ...baseTokens.colors.light.button,
          background: {
            primary: 'linear-gradient(90deg, #BCEC79 0%, #81C91C 100%)',
            secondary: '#BCEC79',
          },
        },
        text: {
          ...baseTokens.colors.light.text,
          primary: '#194D05',
          secondary: '#827474',
          link: '#408A13',
          linkHover: colors.green['900'],
          special: 'linear-gradient(90deg, #194D05 0%, #30940A 100%)',
        },
        input: {
          ...baseTokens.colors.light.input,
          fontDefault: '#194D05',
          fontPlaceholder: tinycolor(colors.green['900']).setAlpha(0.5),
          borderDefault: '#FDFFFA',
          borderHover: colors.green['700'],
          borderFocus: colors.green['500'],
        },
      },
      dark: {
        ...baseTokens.colors.dark,
        background: {
          ...baseTokens.colors.dark.background,
          level0: '#081801',
          level1: '#0B2202',
          level2: '#0E2C02',
          level3: '#113503',
          level4: '#143F03',
          level0WithOpacity: 'rgba(9, 29, 2, 0.96)',
        },
        border: {
          ...baseTokens.colors.dark.border,
          base: '#154404',
          divider: '#040E01',
          subduedZen: 'hsla(83, 81%, 80%, 0.03)',
        },
        button: {
          ...baseTokens.colors.dark.button,
          background: {
            primary: 'linear-gradient(90deg, #BCEC79 0%, #81C91C 100%)',
            secondary: '#BCEC79',
          },
        },
        text: {
          ...baseTokens.colors.dark.text,
          primary: '#E4F9C3',
          secondary: '#B8A7A7',
          link: '#6FC025',
          linkHover: colors.green['300'],
          special: 'linear-gradient(90deg, #BCEC79 0%, #81C91C 100%)',
        },
        input: {
          ...baseTokens.colors.dark.input,
          fontDefault: '#E4F9C3',
          fontPlaceholder: tinycolor(colors.green['100']).setAlpha(0.5),
          borderDefault: colors.green['900'],
          borderHover: colors.green['700'],
          borderFocus: colors.green['500'],
        },
      },
    },
  }
}
