/* eslint-disable max-len */
import tinycolor from 'tinycolor2'
import { createBackgroundOpacity } from '../../theme-helpers'

export function getTokens(colors: any, primaryTextColor: string) {
  return {
    colors: {
      light: {
        background: {
          // Background colors
          level0: '#EBE8E0',
          level1: '#EFEDE6',
          level2: '#F5F3EF',
          level3: '#FBFAF9',
          level4: '#FFFFFF',
          base: colors.base.light,
          baseWithOpacity: createBackgroundOpacity(colors.base.hslLight, 0.5),
          special: colors.gradient.dawnLight,
          specialAlpha15: colors.gradient.dawnLightAlpha15,
          specialSecondary: colors.gradient.sunsetLight,
          highlight: colors.green['600'],
        },
        border: {
          base: '#FFFFFF',
          divider: colors.brown['100'],
          highlight: colors.green['600'],
          subduedZen: 'rgba(176, 126, 67, 0.08)',
        },
        // Button colors
        button: {
          background: {
            primary: colors.gradient.dawnDark,
            secondary: colors.gradient.sandLight,
          },
          border: {
            disabled: 'gray.400',
          },
          text: {
            tertiary: colors.gray['600'],
            disabled: 'gray.400',
          },
        },
        // Font colors
        text: {
          primary: colors.gray['700'],
          secondary: colors.gray['500'],
          secondaryAlpha50: tinycolor(colors.gray['500']).setAlpha(0.5),
          primaryGradient: primaryTextColor,
          secondaryGradient: 'linear-gradient(45deg, #728097 0%, #909BAD 100%)',
          special: colors.gradient.dawnLight,
          specialSecondary: colors.gradient.sunsetLight,
          link: colors.purple['500'],
          linkHover: colors.purple['700'],
          maxContrast: '#000',
          highlight: colors.green['600'],
          warning: colors.orange['500'],
        },
        // Input colors
        input: {
          labelFocus: colors.purple['500'], // Not implemented
          labelError: colors.purple['600'], // Not implemented
          fontDefault: 'gray.700',
          fontFocus: 'gray.900',
          fontPlaceholder: tinycolor(colors.brown['500']).setAlpha(0.5),
          fontError: colors.red['900'],
          fontHint: 'gray.500',
          fontHintError: colors.red['600'],
          caret: 'blue.400',
          bgDefault: colors.base.light,
          bgHover: '#F5F3EF',
          bgHoverDisabled: 'rgba(234, 98, 73, 0.2)',
          bgFocus: '#ffffff',
          bgError: 'rgba(254, 244, 242, 0.5)',
          bgErrorFocus: 'tinycolor(colors.base.light).lighten(8)',
          borderDefault: '#DAD3C3',
          borderHover: colors.purple['500'],
          borderFocus: '#7F6AE8',
          borderError: colors.red['500'],
          borderErrorFocus: colors.red['600'],
          borderDisabled: 'blue',
          clearIcon: tinycolor(colors.base.light).lighten(5),
          clearHover: tinycolor(colors.base.light).lighten(1),
          clearError: colors.red['500'],
          clearErrorHover: colors.red['600'],
        },
        icon: {
          base: 'gray.500',
        },
      },
      dark: {
        // Background colors
        background: {
          level0: '#31373F',
          level1: '#383E47',
          level2: '#3F4650',
          level3: '#464D58',
          level4: '#4C5561',
          base: colors.base.dark,
          baseWithOpacity: createBackgroundOpacity(colors.base.hslDark, 0.97),
          level0WithOpacity: 'rgba(49, 55, 63, 0.96)',
          special: colors.gradient.dawnDark,
          specialAlpha15: colors.gradient.dawnDarkAlpha15,
          specialSecondary: colors.gradient.sunsetDark,
          highlight: colors.green['500'],
        },
        // Border colors
        border: {
          base: '#4C5561',
          divider: colors.gray['800'],
          highlight: colors.green['500'],
          zen: 'rgba(76, 85, 97, 0.50)',
          subduedZen: 'rgba(229, 211, 190, 0.05)',
        },
        // Button colors
        button: {
          background: {
            primary: colors.gradient.dawnDark,
            secondary: colors.gradient.sandDark,
            tertiary: `linear-gradient(180deg, ${tinycolor(colors.base.dark).lighten(8)} 0%, ${
              colors.base.dark
            } 100%)`,
          },
          border: {
            tertiary: tinycolor(colors.base.dark).lighten(15),
            disabled: 'gray.500',
          },
          text: {
            tertiary: colors.gray['300'],
            disabled: 'gray.500',
          },
        },
        // Font colors
        text: {
          primary: '#E5D3BE',
          secondary: colors.gray['400'],
          secondaryAlpha50: tinycolor(colors.gray['400']).setAlpha(0.15),
          primaryGradient: 'linear-gradient(45deg, #E6C6A0 0%, #E5D3BE 100%)',
          secondaryGradient: 'linear-gradient(45deg, #909BAD 0%, #728097 100%)',
          special: 'linear-gradient(90deg, #B3AEF5 0%, #D7CBE7 25%, #E5C8C8 50%, #EAA879 100%)',
          specialSecondary: 'linear-gradient(180deg, #EA9A43 0%, #F06147 100%)',
          link: colors.purple['300'],
          linkHover: colors.purple['100'],
          maxContrast: '#fff',
          highlight: colors.green['500'],
          warning: colors.orange['300'],
        },
        input: {
          labelFocus: colors.purple['400'],
          labelError: colors.red['400'],

          fontDefault: 'brown.200',
          fontFocus: 'white',
          fontPlaceholder: tinycolor(colors.gray['500']).setAlpha(0.8),
          fontError: colors.red['200'],
          fontHint: 'gray.400',
          fontHintError: colors.red['400'],
          caret: 'green.400',
          bgDefault: tinycolor(colors.base.dark).darken(2),
          bgHover: tinycolor(colors.base.dark).darken(4),
          bgHoverDisabled: tinycolor(colors.red[500]).setAlpha(0.2),
          bgFocus: tinycolor(colors.base.dark).darken(8),
          bgError: '#474046',
          bgErrorFocus: tinycolor(colors.base.dark).darken(8),
          borderDefault: tinycolor(colors.base.dark).lighten(10),
          borderHover: colors.purple['400'],
          borderFocus: colors.purple['400'],
          borderError: colors.red['400'],
          borderErrorFocus: colors.red['300'],
          borderDisabled: 'yellow',
          clearIcon: tinycolor(colors.base.dark).lighten(5),
          clearHover: tinycolor(colors.base.light).lighten(1),
          clearError: colors.red['400'],
          clearErrorHover: colors.red['500'],
        },
        icon: {
          base: 'gray.400',
        },
      },
    },
    shadows: {
      light: {
        sm: '0px 0px 0px 1px #49351D05, 1px 1px 1px -0.5px #49351D0F, 3px 3px 3px -1.5px #49351D0F',
        md: '0px 0px 0px 1px #49351D05, 1px 1px 1px -0.5px #49351D0F, 3px 3px 3px -1.5px #49351D0F, 6px 6px 6px -3px #49351D0F, -0.5px -0.5px 0px 0px #FFFFFF',
        lg: '0px 0px 0px 1px #49351D05, 1px 1px 1px -0.5px #49351D0F, 3px 3px 3px -1.5px #49351D0F, 6px 6px 6px -3px #49351D0F, 12px 12px 12px -6px #49351D0F, -0.5px -1px 0px 0px #FFFFFF',
        xl: '0px 0px 0px 1px #49351D05, 1px 1px 1px -0.5px #49351D0F, 3px 3px 3px -1.5px #49351D0F, 6px 6px 6px -3px #49351D0F, 12px 12px 12px -6px #49351D0F, 24px 24px 24px -12px #49351D0F, -0.5px -1px 0px 0px #FFFFFF',
        '2xl':
          '0px 0px 0px 1px #49351D05, 1px 1px 1px -0.5px #49351D0F, 3px 3px 3px -1.5px #49351D0F, 6px 6px 6px -3px #49351D0F, 12px 12px 12px -6px #49351D0F, 24px 24px 24px -12px #49351D0F, 42px 42px 42px -24px #49351D0F, -0.5px -1px 0px 0px #FFFFFF',
        '3xl':
          '0px 0px 0px 1px #49351D05, 1px 1px 1px -0.5px #49351D0F, 3px 3px 3px -1.5px #49351D0F, 6px 6px 6px -3px #49351D0F, 12px 12px 12px -6px #49351D0F, 24px 24px 24px -12px #49351D0F, 42px 42px 42px -24px #49351D0F, 0px 42px 84px 0 #49351D0F, -0.5px -1px 0px 0px #FFFFFF',

        shadowInnerBase:
          '0px 2px 4px 0px rgba(0, 0, 0, 0.05) inset, 0px 4px 8px 0px rgba(0, 0, 0, 0.05) inset, 0px 10px 20px 0px rgba(0, 0, 0, 0.05) inset',
        btnDefault:
          '0.1rem 0.1rem 0.1rem 0px rgba(255, 255, 255, 0.5) inset, -0.1rem -0.1rem 0.1rem 0px rgba(0, 0, 0, 0.15) inset, 0.125rem 0.125rem 0.125rem 0px rgba(0, 0, 0, 0.15)',
        btnDefaultActive:
          '0px 0px 8px 0px rgba(0, 0, 0, 0.1) inset, 0px 0px 2px 0px rgba(0, 0, 0, 0.1) inset',
        btnTertiary:
          '0.1rem 0.1rem 0.1rem 0px rgba(255, 255, 255, 0.5) inset, -0.1rem -0.1rem 0.1rem 0px rgba(0, 0, 0, 0.15) inset, 0.1rem 0.1rem 0.1rem 0px rgba(0, 0, 0, 0.07)',
        fontDefault: '0px -1px 0px rgba(255, 255, 255, 0.05), 0px 1px 2px rgba(0, 0, 0, 0.2)',
        fontLight: '0px -1px 0px rgba(255, 255, 255, 0.30), 0px 1px 2px rgba(0, 0, 0, 0.20)',
        fontDark: '0px -1px 0px rgba(255, 255, 255, 0.30), 0px 1px 2px rgba(0, 0, 0, 0.05)',
        input: {
          innerBase:
            '0px 2px 4px 0px rgba(0, 0, 0, 0.05) inset, 0px 4px 8px 0px rgba(0, 0, 0, 0.05) inset, 0px 10px 20px 0px rgba(0, 0, 0, 0.05) inset, 0px -1px 0px 0px rgba(255, 255, 255, 0.8) inset',
          innerFocus: `0px 2px 4px 0px ${tinycolor(colors.purple['500']).setAlpha(
            0.1
          )} inset, 0px 4px 8px 0px ${tinycolor(colors.purple['500']).setAlpha(
            0.2
          )} inset, 0 0 0 1px ${colors.purple['500']}`,
          innerError: `0px 2px 4px 0px ${tinycolor(colors.red['500']).setAlpha(
            0.1
          )} inset, 0px 4px 8px 0px ${tinycolor(colors.red['500']).setAlpha(
            0.1
          )} inset, 0 0 0 1px ${colors.red['500']}`,
        },
        innerXl:
          '4px 4px 4px 0px rgba(0, 0, 0, 0.04) inset, 7px 6px 12px 0px rgba(0, 0, 0, 0.08) inset, 40px 40px 80px 0px rgba(0, 0, 0, 0.05) inset, 0px -1px 1px 0px rgba(255, 255, 255, 0.25) inset',
        chartIconInner:
          'drop-shadow(0px 0px 0px rgba(73, 53, 29, 0.02)) drop-shadow(1px 1px 1px rgba(73, 53, 29, 0.06)) drop-shadow(3px 3px 3px rgba(73, 53, 29, 0.06)) drop-shadow(-0.5px -1px 0px #FFF)',
        chartIconOuter:
          'drop-shadow(0px 0px 0px rgba(73, 53, 29, 0.02)) drop-shadow(1px 1px 1px rgba(73, 53, 29, 0.06)) drop-shadow(3px 3px 3px rgba(73, 53, 29, 0.06)) drop-shadow(-0.5px -1px 0px #FFF)',
        chart:
          'drop-shadow(0px 0px 0px rgba(73, 53, 29, 0.4)) drop-shadow(1px 1px 1px rgba(73, 53, 29, 0.09)) drop-shadow(5px 3px 15px rgba(73, 53, 29, 0.3)) drop-shadow(4px -2px 4px rgba(73, 53, 29, 0.2)) drop-shadow(-0.5px -1px 0px #FFF)',
        zen: '0px 4px 4px 0px rgba(0, 0, 0, 0.03);',
      },
      dark: {
        sm: '0px 0px 0px 1px #00000005, 1px 1px 1px -0.5px #0000000F, 3px 3px 3px -1.5px #0000000F',
        md: '0px 0px 0px 1px #00000005, 1px 1px 1px -0.5px #0000000F, 3px 3px 3px -1.5px #0000000F, 6px 6px 6px -3px #0000001A, -0.5px -1px 0px 0px #FFFFFF33',
        lg: '0px 0px 0px 1px #00000005, 1px 1px 1px -0.5px #0000000F, 3px 3px 3px -1.5px #0000000F, 6px 6px 6px -3px #0000000F, 12px 12px 12px -6px #0000001A, 0px -1px 0px 0px #FFFFFF26',
        xl: '0px 0px 0px 1px #00000005, 1px 1px 1px -0.5px #0000000F, 3px 3px 3px -1.5px #0000000F, 6px 6px 6px -3px #0000000F, 12px 12px 12px -6px #0000000F, 24px 24px 24px -12px #0000001A, -0.5px -1px 0px 0px #FFFFFF26',
        '2xl':
          '0px 0px 0px 1px #00000005, 1px 1px 1px -0.5px #0000000F, 3px 3px 3px -1.5px #0000000F, 6px 6px 6px -3px #0000000F, 12px 12px 12px -6px #0000000F, 24px 24px 24px -12px #0000000F, 42px 42px 42px -24px #0000000F, -0.5px -0.5px 0px 0px #FFFFFF26',
        '3xl':
          '0px 0px 0px 1px #00000005, 1px 1px 1px -0.5px #0000000F, 3px 3px 3px -1.5px #0000000F, 6px 6px 6px -3px #0000000F, 12px 12px 12px -6px #0000000F, 24px 24px 24px -12px #0000000F, 42px 42px 42px -24px #0000000F, 0px 42px 84px 0 rgba(0,0,0,0.3), -0.5px -0.5px 0px 0px #FFFFFF26',
        shadowInnerBase:
          '0px 2px 4px 0px rgba(0, 0, 0, 0.10) inset, 0px 4px 8px 0px rgba(0, 0, 0, 0.10) inset, 0px 10px 20px 0px rgba(0, 0, 0, 0.10) inset',
        btnDefault:
          '0.1rem 0.1rem 0.1rem 0px rgba(255, 255, 255, 0.75) inset, -0.1rem -0.1rem 0.1rem 0px rgba(0, 0, 0, 0.3) inset, 0.125rem 0.125rem 0.125rem 0px rgba(0, 0, 0, 0.25)',
        btnDefaultActive:
          '0px 0px 8px 0px rgba(0, 0, 0, 0.50) inset, 0px 0px 4px 0px rgba(0, 0, 0, 0.70) inset',
        btnTertiary:
          '0.1rem 0.1rem 0.1rem 0px rgba(255, 255, 255, 0.05) inset, -0.1rem -0.1rem 0.1rem 0px rgba(0, 0, 0, 0.15) inset, 0.125rem 0.125rem 0.125rem 0px rgba(0, 0, 0, 0.09)',
        fontDefault: '0px -1px 0px rgba(255, 255, 255, 0.30), 0px 1px 2px rgba(0, 0, 0, 0.20)',
        fontLight: '0px -1px 0px rgba(255, 255, 255, 0.30), 0px 1px 2px rgba(0, 0, 0, 0.20)',
        fontDark: '0px -1px 0px rgba(255, 255, 255, 0.30), 0px 1px 2px rgba(0, 0, 0, 0.20)',
        input: {
          innerBase:
            '0px 2px 4px 0px rgba(0, 0, 0, 0.10) inset, 0px 4px 8px 0px rgba(0, 0, 0, 0.10) inset, 0px 10px 20px 0px rgba(0, 0, 0, 0.10) inset, 0px -1px 0px 0px rgba(255, 255, 255, 0.15) inset',
          innerFocus: `0px 2px 4px 0px ${tinycolor(colors.purple['400']).setAlpha(
            0.1
          )} inset, 0px 4px 8px 0px ${tinycolor(colors.purple['400']).setAlpha(
            0.2
          )} inset, 0 0 0 1px ${colors.purple['400']}`,
          innerError: `0px 2px 4px 0px ${tinycolor(colors.red['500']).setAlpha(
            0.2
          )} inset, 0px 4px 8px 0px ${tinycolor(colors.red['500']).setAlpha(
            0.2
          )} inset, 0 0 0 1px ${colors.red['500']}`,
        },
        innerXl:
          '20px 20px 50px 0px rgba(0, 0, 0, 0.25) inset, 10px 10px 25px 0px rgba(0, 0, 0, 0.18) inset, 2px 2px 11px 0px rgba(0, 0, 0, 0.19) inset, 0px -1px 1px 0px #FFFFFF40 inset',

        chartIconInner:
          'drop-shadow(0px 0px 0px rgba(0, 0, 0, 0.02)) drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.06)) drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.06))',
        chartIconOuter:
          'drop-shadow(0px 0px 0px rgba(0, 0, 0, 0.2)) drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.1)) drop-shadow(3px 5px 5px rgba(0, 0, 0, 0.2))',
        chart:
          'drop-shadow(0px 0px 0px rgba(0, 0, 0, 0.02)) drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.1)) drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.1)) drop-shadow(6px 6px 6px rgba(0, 0, 0, 0.1)) drop-shadow(12px 12px 12px rgba(0, 0, 0, 0.06)) drop-shadow(42px 42px 42px rgba(0, 0, 0, 0.06))',
        zen: '0px 4px 4px 0px rgba(0, 0, 0, 0.10)',
      },
    },
    transition: {
      default: 'all 0.3s ease-in-out',
      fast: 'all 0.2s ease-in-out',
      slow: 'all 0.5s ease-in-out',
    },
  }
}
