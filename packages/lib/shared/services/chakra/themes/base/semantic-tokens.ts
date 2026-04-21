export type SemanticTokens = ReturnType<typeof getSemanticTokens>

export function getSemanticTokens(tokens: any, colors: any) {
  return {
    colors: {
      primary: { _dark: 'primary.500' },
      grayText: {
        _dark: tokens.colors.dark.text.secondary,
      },
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
        level0: {
          _dark: tokens.colors.dark.background.level0,
        },
        level1: {
          _dark: tokens.colors.dark.background.level1,
        },
        level2: {
          _dark: tokens.colors.dark.background.level2,
        },
        level3: {
          _dark: tokens.colors.dark.background.level3,
        },
        level4: {
          _dark: tokens.colors.dark.background.level4,
        },
        base: {
          _dark: tokens.colors.dark.background.base,
        },
        baseWithOpacity: {
          _dark: tokens.colors.dark.background.baseWithOpacity,
        },
        level0WithOpacity: {
          _dark: tokens.colors.dark.background.level0WithOpacity,
        },
        special: {
          _dark: tokens.colors.dark.background.special,
        },
        specialAlpha15: {
          _dark: tokens.colors.dark.background.specialAlpha15,
        },
        specialSecondary: {
          _dark: tokens.colors.dark.background.specialSecondary,
        },
        highlight: {
          _dark: tokens.colors.dark.background.highlight,
        },
        gold: {
          _dark: tokens.colors.dark.background.gold,
        },
        button: {
          primary: {
            _dark: tokens.colors.dark.button.background.primary,
          },
          secondary: {
            _dark: tokens.colors.dark.button.background.secondary,
          },
        },
        warning: {
          _dark: tokens.colors.dark.background.warning,
        },
      },
      input: {
        fontDefault: {
          _dark: tokens.colors.dark.input.fontDefault,
        },
        fontPlaceholder: {
          _dark: tokens.colors.dark.input.fontPlaceholder,
        },
        fontFocus: {
          _dark: tokens.colors.dark.input.fontFocus,
        },
        fontError: {
          _dark: tokens.colors.dark.input.fontError,
        },
        fontHint: {
          _dark: tokens.colors.dark.input.fontHint,
        },
        fontHintError: {
          _dark: tokens.colors.dark.input.fontHintError,
        },
        borderDefault: {
          _dark: tokens.colors.dark.input.borderDefault,
        },
        borderHover: {
          _dark: tokens.colors.dark.input.borderHover,
        },
        borderFocus: {
          _dark: tokens.colors.dark.input.borderFocus,
        },
        borderError: {
          _dark: tokens.colors.dark.input.borderError,
        },
        borderErrorFocus: {
          _dark: tokens.colors.dark.input.borderErrorFocus,
        },
        borderDisabled: {
          _dark: tokens.colors.dark.input.borderDisabled,
        },
        caret: {
          _dark: tokens.colors.dark.input.caret,
        },
        bgDefault: {
          _dark: tokens.colors.dark.input.bgDefault,
        },
        bgHover: {
          _dark: tokens.colors.dark.input.bgHover,
        },
        bgHoverDisabled: {
          _dark: tokens.colors.dark.input.bgHoverDisabled,
        },
        bgFocus: {
          _dark: tokens.colors.dark.input.bgFocus,
        },
        bgError: {
          _dark: tokens.colors.dark.input.bgError,
        },
        bgErrorFocus: {
          _dark: tokens.colors.dark.input.bgErrorFocus,
        },
        clearIcon: {
          _dark: tokens.colors.dark.input.clearIcon,
        },
      },
      formLabel: {
        focus: {
          _dark: tokens.colors.dark.input.labelFocus,
        },
        error: {
          _dark: tokens.colors.dark.input.labelError,
        },
      },
      formErrorMessage: {
        _dark: tokens.colors.dark.input.labelError,
      },
      backgroundImage: {
        card: {
          gradient: {
            _dark: `radial-gradient(
                farthest-corner at 80px 0px,
                rgba(180, 189, 200, 0.3) 0%,
                rgba(255, 255, 255, 0.0) 100%
              )`,
          },
        },
      },

      border: {
        base: {
          _dark: tokens.colors.dark.border.base,
        },
        divider: {
          _dark: tokens.colors.dark.border.divider,
        },
        highlight: {
          _dark: tokens.colors.dark.border.highlight,
        },
        button: {
          disabled: {
            _dark: tokens.colors.dark.button.border.disabled,
          },
        },
        zen: {
          _dark: tokens.colors.dark.border.zen,
        },
        subduedZen: {
          _dark: tokens.colors.dark.border.subduedZen,
        },
      },

      icon: {
        base: {
          _dark: tokens.colors.dark.icon.base,
        },
      },

      // Text colors
      font: {
        primary: {
          _dark: tokens.colors.dark.text.primary,
        },
        secondary: {
          _dark: tokens.colors.dark.text.secondary,
        },
        secondaryAlpha50: {
          _dark: tokens.colors.dark.text.secondaryAlpha50,
        },
        primaryGradient: {
          _dark: tokens.colors.dark.text.primaryGradient,
        },
        secondaryGradient: {
          _dark: tokens.colors.dark.text.secondaryGradient,
        },
        special: {
          _dark: tokens.colors.dark.text.special,
        },
        specialSecondary: {
          _dark: tokens.colors.dark.text.specialSecondary,
        },
        opposite: {
          _dark: tokens.colors.light.text.primary,
        },
        link: {
          _dark: tokens.colors.dark.text.link,
        },
        linkHover: {
          _dark: tokens.colors.dark.text.linkHover,
        },
        maxContrast: {
          _dark: tokens.colors.dark.text.maxContrast,
        },
        maxContrastOpposite: {
          _dark: tokens.colors.dark.text.maxContrastOpposite,
        },
        highlight: {
          _dark: tokens.colors.dark.text.highlight,
        },
        warning: {
          _dark: tokens.colors.dark.text.warning,
        },
        error: {
          _dark: tokens.colors.dark.text.error,
        },
        accordionHeading: {
          _dark: tokens.colors.dark.button.background.primary,
        },
        button: {
          tertiary: {
            _dark: tokens.colors.dark.button.text.tertiary,
          },
          disabled: {
            _dark: tokens.colors.dark.button.text.disabled,
          },
          primary: {
            _dark: '#414853',
          },
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
      sm: {
        _dark: tokens.shadows.dark.sm,
      },
      md: {
        _dark: tokens.shadows.dark.md,
      },
      lg: {
        _dark: tokens.shadows.dark.lg,
      },
      xl: {
        _dark: tokens.shadows.dark.xl,
      },
      '2xl': {
        _dark: tokens.shadows.dark['2xl'],
      },
      '3xl': {
        _dark: tokens.shadows.dark['3xl'],
      },
      innerSm: 'inset 0 0 4px 0 rgba(0, 0, 0, 0.06)',
      innerBase: {
        _dark: tokens.shadows.dark['shadowInnerBase'],
      },
      innerMd: 'inset 0 0 6px 0 rgba(0, 0, 0, 0.1)',
      innerLg: {
        _dark: tokens.shadows.dark.innerLg,
      },
      innerXl: {
        _dark: tokens.shadows.dark.innerXl,
      },
      innerRockShadow: {
        _dark: tokens.shadows.dark.innerRockShadow,
      },
      innerRockShadowSm: {
        _dark: tokens.shadows.dark.innerRockShadowSm,
      },
      chartIconInner: {
        _dark: tokens.shadows.dark.chartIconInner,
      },
      chartIconOuter: {
        _dark: tokens.shadows.dark.chartIconOuter,
      },
      chart: {
        _dark: tokens.shadows.dark.chart,
      },
      zen: {
        _dark: tokens.shadows.dark.zen,
      },
      btnDefault: {
        _dark: tokens.shadows.dark.btnDefault,
      },
      btnDefaultActive: {
        _dark: tokens.shadows.dark.btnDefaultActive,
      },
      btnTertiary: {
        _dark: tokens.shadows.dark.btnTertiary,
      },
      fontDefault: {
        _dark: tokens.shadows.dark.fontDefault,
      },
      fontLight: {
        _dark: tokens.shadows.dark.fontLight,
      },
      fontDark: {
        _dark: tokens.shadows.dark.fontDark,
      },
      input: {
        innerBase: {
          _dark: tokens.shadows.dark.input.innerBase,
        },
        innerFocus: {
          _dark: tokens.shadows.dark.input.innerFocus,
        },
        innerError: {
          _dark: tokens.shadows.dark.input.innerError,
        },
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
