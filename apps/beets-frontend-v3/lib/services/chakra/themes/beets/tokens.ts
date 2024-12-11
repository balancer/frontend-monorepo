import tinycolor from 'tinycolor2'
import { getTokens } from '@repo/lib/shared/services/chakra/themes/base/tokens'

export function getBeetsTokens(colors: any, primaryTextColor: any) {
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
          linkHover: colors.gray['900'],
          special: 'linear-gradient(90deg, #194D05 0%, #30940A 100%)',
        },
        input: {
          ...baseTokens.colors.light.input,
          fontDefault: '#194D05',
          fontPlaceholder: tinycolor(colors.gray['900']).setAlpha(0.5),
          borderDefault: '#FDFFFA',
          borderHover: colors.gray['700'],
          borderFocus: colors.gray['500'],
        },
      },
      dark: {
        ...baseTokens.colors.dark,
        background: {
          ...baseTokens.colors.dark.background,
          level0: 'linear-gradient(90deg, #111111 0%, #333333 100%)',
          level1: '#343434',
          level2: '#404040',
          level3: '#4b4b4b',
          level4: '#787878',
          level0WithOpacity: 'rgba(30, 30, 30, 0.96)',
        },
        border: {
          ...baseTokens.colors.dark.border,
          base: 'rgba(145,226,193,0.25)',
          divider: '#040E01',
          subduedZen: 'hsla(83, 81%, 80%, 0.03)',
        },
        button: {
          ...baseTokens.colors.dark.button,
          background: {
            primary: 'linear-gradient(90deg, #91E2C1 0%, #05D690 100%)',
            secondary: '#05D690',
          },
        },
        text: {
          ...baseTokens.colors.dark.text,
          primary: '#FFFFFF',
          secondary: '#DDDDDD',
          link: '#05D690',
          linkHover: '#91e2c1',
          special: 'linear-gradient(90deg, #78EABC 0%, #18B575 100%)',
          highlight: '#FF0000',
          navLink: '#91e2c1'
        },
        input: {
          ...baseTokens.colors.dark.input,
          fontDefault: '#91e2c1',
          fontPlaceholder: tinycolor(colors.gray['100']).setAlpha(0.5),
          borderDefault: colors.gray['900'],
          borderHover: colors.gray['700'],
          borderFocus: colors.gray['500'],
          bgDefault: '#262626',
          bgHover: tinycolor('#262626').darken(2),
          bgFocus: tinycolor('262626').darken(4),
        },
      },
    },
  }
}
