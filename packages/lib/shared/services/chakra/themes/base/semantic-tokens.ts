export type SemanticTokens = ReturnType<typeof getSemanticTokens>

export function getSemanticTokens(tokens: any, colors: any) {
  return {
    colors: {
      primary: 'primary.500',
      grayText: tokens.colors.dark.text.secondary,
      gradients: {
        text: {
          heading: {
            from: '#707883',
            to: '#2D4C7E',
          },
        },
        button: {
          sand: {
            from: '#E5D3BE',
            to: '#E6C6A0',
          },
        },
      },

      // Background colors
      background: {
        level0: tokens.colors.dark.background.level0,
        level1: tokens.colors.dark.background.level1,
        level2: tokens.colors.dark.background.level2,
        level3: tokens.colors.dark.background.level3,
        level4: tokens.colors.dark.background.level4,
        base: tokens.colors.dark.background.base,
        baseWithOpacity: tokens.colors.dark.background.baseWithOpacity,
        level0WithOpacity: tokens.colors.dark.background.level0WithOpacity,
        special: tokens.colors.dark.background.special,
        specialAlpha15: tokens.colors.dark.background.specialAlpha15,
        specialSecondary: tokens.colors.dark.background.specialSecondary,
        highlight: tokens.colors.dark.background.highlight,
        gold: tokens.colors.dark.background.gold,
        button: {
          primary: tokens.colors.dark.button.background.primary,
          secondary: tokens.colors.dark.button.background.secondary,
        },
        warning: tokens.colors.dark.background.warning,
      },
      input: {
        fontDefault: tokens.colors.dark.input.fontDefault,
        fontPlaceholder: tokens.colors.dark.input.fontPlaceholder,
        fontFocus: tokens.colors.dark.input.fontFocus,
        fontError: tokens.colors.dark.input.fontError,
        fontHint: tokens.colors.dark.input.fontHint,
        fontHintError: tokens.colors.dark.input.fontHintError,
        borderDefault: tokens.colors.dark.input.borderDefault,
        borderHover: tokens.colors.dark.input.borderHover,
        borderFocus: tokens.colors.dark.input.borderFocus,
        borderError: tokens.colors.dark.input.borderError,
        borderErrorFocus: tokens.colors.dark.input.borderErrorFocus,
        borderDisabled: tokens.colors.dark.input.borderDisabled,
        caret: tokens.colors.dark.input.caret,
        bgDefault: tokens.colors.dark.input.bgDefault,
        bgHover: tokens.colors.dark.input.bgHover,
        bgHoverDisabled: tokens.colors.dark.input.bgHoverDisabled,
        bgFocus: tokens.colors.dark.input.bgFocus,
        bgError: tokens.colors.dark.input.bgError,
        bgErrorFocus: tokens.colors.dark.input.bgErrorFocus,
        clearIcon: tokens.colors.dark.input.clearIcon,
      },
      formLabel: {
        focus: tokens.colors.dark.input.labelFocus,
        error: tokens.colors.dark.input.labelError,
      },
      formErrorMessage: tokens.colors.dark.input.labelError,
      backgroundImage: {
        card: {
          gradient: `radial-gradient(
                farthest-corner at 80px 0px,
                rgba(180, 189, 200, 0.3) 0%,
                rgba(255, 255, 255, 0.0) 100%
              )`,
        },
      },

      border: {
        base: tokens.colors.dark.border.base,
        divider: tokens.colors.dark.border.divider,
        highlight: tokens.colors.dark.border.highlight,
        button: {
          disabled: tokens.colors.dark.button.border.disabled,
        },
        zen: tokens.colors.dark.border.zen,
        subduedZen: tokens.colors.dark.border.subduedZen,
      },

      icon: {
        base: tokens.colors.dark.icon.base,
      },

      // Text colors
      font: {
        primary: tokens.colors.dark.text.primary,
        secondary: tokens.colors.dark.text.secondary,
        secondaryAlpha50: tokens.colors.dark.text.secondaryAlpha50,
        primaryGradient: tokens.colors.dark.text.primaryGradient,
        secondaryGradient: tokens.colors.dark.text.secondaryGradient,
        special: tokens.colors.dark.text.special,
        specialSecondary: tokens.colors.dark.text.specialSecondary,
        opposite: tokens.colors.light.text.primary,
        link: tokens.colors.dark.text.link,
        linkHover: tokens.colors.dark.text.linkHover,
        maxContrast: tokens.colors.dark.text.maxContrast,
        maxContrastOpposite: tokens.colors.dark.text.maxContrastOpposite,
        highlight: tokens.colors.dark.text.highlight,
        warning: tokens.colors.dark.text.warning,
        error: tokens.colors.dark.text.error,
        accordionHeading: tokens.colors.dark.button.background.primary,
        button: {
          tertiary: tokens.colors.dark.button.text.tertiary,
          disabled: tokens.colors.dark.button.text.disabled,
          primary: '#414853',
        },
        dark: colors.gray['700'], // always dark
        light: '#E5D3BE', // always light
      },

      chart: {
        stakedBalance: '#9F95F0',
        pool: {
          bar: {
            volume: {
              from: 'rgba(0, 211, 149, 1)',
              to: 'rgba(0, 211, 149, 0.2)',
              cow: {
                from: 'rgba(111, 192, 37, 1)',
                to: 'rgba(111, 192, 37, 0.5)',
                hover: '#00a1ff',
              },
            },
          },
          scatter: {
            add: {
              from: 'rgba(0, 211, 149, 100%)',
              to: 'rgba(0, 211, 149, 20%)',
              label: 'linear-gradient(to bottom, rgba(0, 211, 149, 100%), rgba(0, 211, 149, 20%))',
            },
            remove: {
              from: 'rgba(239, 68, 68, 100%)',
              to: 'rgba(239, 68, 68, 20%)',
              label: 'linear-gradient(to bottom, rgba(239, 68, 68, 100%), rgba(239, 68, 68, 20%))',
            },
            swap: {
              from: 'rgba(109, 173, 249, 100%)',
              to: 'rgba(109, 173, 249, 20%)',
              label:
                'linear-gradient(to bottom, rgba(109, 173, 249, 100%), rgba(109, 173, 249, 20%))',
            },
          },
        },
      },
    },
    space: {
      none: '0',
      xxs: '0.125rem',
      xs: '0.25rem',
      sm: '0.5rem',
      ms: '0.75rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '4rem',
      '3xl': '6rem',
    },
    shadows: {
      sm: tokens.shadows.dark.sm,
      md: tokens.shadows.dark.md,
      lg: tokens.shadows.dark.lg,
      xl: tokens.shadows.dark.xl,
      '2xl': tokens.shadows.dark['2xl'],
      '3xl': tokens.shadows.dark['3xl'],
      innerSm: 'inset 0 0 4px 0 rgba(0, 0, 0, 0.06)',
      innerBase: tokens.shadows.dark['shadowInnerBase'],
      innerMd: 'inset 0 0 6px 0 rgba(0, 0, 0, 0.1)',
      innerLg: tokens.shadows.dark.innerLg,
      innerXl: tokens.shadows.dark.innerXl,
      innerRockShadow: tokens.shadows.dark.innerRockShadow,
      innerRockShadowSm: tokens.shadows.dark.innerRockShadowSm,
      chartIconInner: tokens.shadows.dark.chartIconInner,
      chartIconOuter: tokens.shadows.dark.chartIconOuter,
      chart: tokens.shadows.dark.chart,
      zen: tokens.shadows.dark.zen,
      btnDefault: tokens.shadows.dark.btnDefault,
      btnDefaultActive: tokens.shadows.dark.btnDefaultActive,
      btnTertiary: tokens.shadows.dark.btnTertiary,
      fontDefault: tokens.shadows.dark.fontDefault,
      fontLight: tokens.shadows.dark.fontLight,
      fontDark: tokens.shadows.dark.fontDark,
      input: {
        innerBase: tokens.shadows.dark.input.innerBase,
        innerFocus: tokens.shadows.dark.input.innerFocus,
        innerError: tokens.shadows.dark.input.innerError,
      },
    },
    sizes: {
      maxContent: '1320px',
      screenHeight: '100vh',
      screenWidth: '100vw',
    },
    radii: {
      default: 'md',
      xs: '0.125rem',
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
  }
}
