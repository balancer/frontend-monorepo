export type SemanticTokens = ReturnType<typeof getSemanticTokens>

export function getSemanticTokens(tokens: any, colors: any) {
  return {
    colors: {
      primary: { _light: 'primary.500', _dark: 'primary.500' },
      grayText: {
        default: tokens.colors.light.text.secondary,
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
          default: tokens.colors.light.background.level0,
          _dark: tokens.colors.dark.background.level0,
        },
        level1: {
          default: tokens.colors.light.background.level1,
          _dark: tokens.colors.dark.background.level1,
        },
        level2: {
          default: tokens.colors.light.background.level2,
          _dark: tokens.colors.dark.background.level2,
        },
        level3: {
          default: tokens.colors.light.background.level3,
          _dark: tokens.colors.dark.background.level3,
        },
        level4: {
          default: tokens.colors.light.background.level4,
          _dark: tokens.colors.dark.background.level4,
        },
        base: {
          default: tokens.colors.light.background.base,
          _dark: tokens.colors.dark.background.base,
        },
        baseWithOpacity: {
          default: tokens.colors.light.background.baseWithOpacity,
          _dark: tokens.colors.dark.background.baseWithOpacity,
        },
        level0WithOpacity: {
          default: tokens.colors.light.background.baseWithOpacity,
          _dark: tokens.colors.dark.background.level0WithOpacity,
        },
        special: {
          default: tokens.colors.light.background.special,
          _dark: tokens.colors.dark.background.special,
        },
        specialAlpha15: {
          default: tokens.colors.light.background.specialAlpha15,
          _dark: tokens.colors.dark.background.specialAlpha15,
        },
        specialSecondary: {
          default: tokens.colors.light.background.specialSecondary,
          _dark: tokens.colors.dark.background.specialSecondary,
        },
        highlight: {
          default: tokens.colors.light.background.highlight,
          _dark: tokens.colors.dark.background.highlight,
        },
        button: {
          primary: {
            default: tokens.colors.light.button.background.primary,
            _dark: tokens.colors.dark.button.background.primary,
          },
          secondary: {
            default: tokens.colors.light.button.background.secondary,
            _dark: tokens.colors.dark.button.background.secondary,
          },
        },
      },
      input: {
        fontDefault: {
          default: tokens.colors.light.input.fontDefault,
          _dark: tokens.colors.dark.input.fontDefault,
        },
        fontPlaceholder: {
          default: tokens.colors.light.input.fontPlaceholder,
          _dark: tokens.colors.dark.input.fontPlaceholder,
        },
        fontFocus: {
          default: tokens.colors.light.input.fontFocus,
          _dark: tokens.colors.dark.input.fontFocus,
        },
        fontError: {
          default: tokens.colors.light.input.fontError,
          _dark: tokens.colors.dark.input.fontError,
        },
        fontHint: {
          default: tokens.colors.light.input.fontHint,
          _dark: tokens.colors.dark.input.fontHint,
        },
        fontHintError: {
          default: tokens.colors.light.input.fontHintError,
          _dark: tokens.colors.dark.input.fontHintError,
        },
        borderDefault: {
          default: tokens.colors.light.input.borderDefault,
          _dark: tokens.colors.dark.input.borderDefault,
        },
        borderHover: {
          default: tokens.colors.light.input.borderHover,
          _dark: tokens.colors.dark.input.borderHover,
        },
        borderFocus: {
          default: tokens.colors.light.input.borderFocus,
          _dark: tokens.colors.dark.input.borderFocus,
        },
        borderError: {
          default: tokens.colors.light.input.borderError,
          _dark: tokens.colors.dark.input.borderError,
        },
        borderErrorFocus: {
          default: tokens.colors.light.input.borderErrorFocus,
          _dark: tokens.colors.dark.input.borderErrorFocus,
        },
        borderDisabled: {
          default: tokens.colors.light.input.borderDisabled,
          _dark: tokens.colors.dark.input.borderDisabled,
        },
        caret: {
          default: tokens.colors.light.input.caret,
          _dark: tokens.colors.dark.input.caret,
        },
        bgDefault: {
          default: tokens.colors.light.input.bgDefault,
          _dark: tokens.colors.dark.input.bgDefault,
        },
        bgHover: {
          default: tokens.colors.light.input.bgHover,
          _dark: tokens.colors.dark.input.bgHover,
        },
        bgHoverDisabled: {
          default: tokens.colors.light.input.bgHoverDisabled,
          _dark: tokens.colors.dark.input.bgHoverDisabled,
        },
        bgFocus: {
          default: tokens.colors.light.input.bgFocus,
          _dark: tokens.colors.dark.input.bgFocus,
        },
        bgError: {
          default: tokens.colors.light.input.bgError,
          _dark: tokens.colors.dark.input.bgError,
        },
        bgErrorFocus: {
          default: tokens.colors.light.input.bgErrorFocus,
          _dark: tokens.colors.dark.input.bgErrorFocus,
        },
        clearIcon: {
          default: tokens.colors.light.input.clearIcon,
          _dark: tokens.colors.dark.input.clearIcon,
        },
      },
      formLabel: {
        focus: {
          default: tokens.colors.light.input.labelFocus,
          _dark: tokens.colors.dark.input.labelFocus,
        },
        error: {
          default: tokens.colors.light.input.labelError,
          _dark: tokens.colors.dark.input.labelError,
        },
      },
      formErrorMessage: {
        default: tokens.colors.light.input.labelError,
        _dark: tokens.colors.dark.input.labelError,
      },
      backgroundImage: {
        card: {
          gradient: {
            default: `radial-gradient(
                farthest-corner at 80px 0px,
                rgba(235, 220, 204, 0.3) 0%,
                rgba(255, 255, 255, 0.0) 100%
              )`,
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
          default: tokens.colors.light.border.base,
          _dark: tokens.colors.dark.border.base,
        },
        divider: {
          default: tokens.colors.light.border.divider,
          _dark: tokens.colors.dark.border.divider,
        },
        highlight: {
          default: tokens.colors.light.border.highlight,
          _dark: tokens.colors.dark.border.highlight,
        },
        button: {
          disabled: {
            default: tokens.colors.light.button.border.disabled,
            _dark: tokens.colors.dark.button.border.disabled,
          },
        },
        zen: {
          default: 'brown.50',
          _dark: tokens.colors.dark.border.zen,
        },
        subduedZen: {
          default: tokens.colors.light.border.subduedZen,
          _dark: tokens.colors.dark.border.subduedZen,
        },
      },

      icon: {
        base: {
          default: tokens.colors.light.icon.base,
          _dark: tokens.colors.dark.icon.base,
        },
      },

      // Text colors
      font: {
        primary: {
          default: tokens.colors.light.text.primary,
          _dark: tokens.colors.dark.text.primary,
        },
        secondary: {
          default: tokens.colors.light.text.secondary,
          _dark: tokens.colors.dark.text.secondary,
        },
        secondaryAlpha50: {
          default: tokens.colors.light.text.secondaryAlpha50,
          _dark: tokens.colors.dark.text.secondaryAlpha50,
        },
        primaryGradient: {
          default: tokens.colors.light.text.primaryGradient,
          _dark: tokens.colors.dark.text.primaryGradient,
        },
        secondaryGradient: {
          default: tokens.colors.light.text.secondaryGradient,
          _dark: tokens.colors.dark.text.secondaryGradient,
        },
        special: {
          default: tokens.colors.light.text.special,
          _dark: tokens.colors.dark.text.special,
        },
        specialSecondary: {
          default: tokens.colors.light.text.specialSecondary,
          _dark: tokens.colors.dark.text.specialSecondary,
        },
        link: {
          default: tokens.colors.light.text.link,
          _dark: tokens.colors.dark.text.link,
        },
        linkHover: {
          default: tokens.colors.light.text.linkHover,
          _dark: tokens.colors.dark.text.linkHover,
        },
        maxContrast: {
          default: tokens.colors.light.text.maxContrast,
          _dark: tokens.colors.dark.text.maxContrast,
        },
        highlight: {
          default: tokens.colors.light.text.highlight,
          _dark: tokens.colors.dark.text.highlight,
        },
        warning: {
          default: tokens.colors.light.text.warning,
          _dark: tokens.colors.dark.text.warning,
        },
        accordionHeading: {
          default: tokens.colors.light.button.background.primary,
          _dark: tokens.colors.dark.button.background.primary,
        },
        button: {
          tertiary: {
            default: tokens.colors.light.button.text.tertiary,
            _dark: tokens.colors.dark.button.text.tertiary,
          },
          disabled: {
            default: tokens.colors.light.button.text.disabled,
            _dark: tokens.colors.dark.button.text.disabled,
          },
          primary: {
            default: '#F3F1EC',
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
        default: tokens.shadows.light.sm,
        _dark: tokens.shadows.dark.sm,
      },
      md: {
        default: tokens.shadows.light.md,
        _dark: tokens.shadows.dark.md,
      },
      lg: {
        default: tokens.shadows.light.lg,
        _dark: tokens.shadows.dark.lg,
      },
      xl: {
        default: tokens.shadows.light.xl,
        _dark: tokens.shadows.dark.xl,
      },
      '2xl': {
        default: tokens.shadows.light['2xl'],
        _dark: tokens.shadows.dark['2xl'],
      },
      '3xl': {
        default: tokens.shadows.light['3xl'],
        _dark: tokens.shadows.dark['3xl'],
      },
      innerSm: 'inset 0 0 4px 0 rgba(0, 0, 0, 0.06)',
      innerBase: {
        default: tokens.shadows.light['shadowInnerBase'],
        _dark: tokens.shadows.dark['shadowInnerBase'],
      },
      innerMd: 'inset 0 0 6px 0 rgba(0, 0, 0, 0.1)',
      innerLg: 'inset 0 0 8px 0 rgba(0, 0, 0, 0.15)',

      innerXl: {
        default: tokens.shadows.light.innerXl,
        _dark: tokens.shadows.dark.innerXl,
      },
      chartIconInner: {
        default: tokens.shadows.light.chartIconInner,
        _dark: tokens.shadows.dark.chartIconInner,
      },
      chartIconOuter: {
        default: tokens.shadows.light.chartIconOuter,
        _dark: tokens.shadows.dark.chartIconOuter,
      },
      chart: {
        default: tokens.shadows.light.chart,
        _dark: tokens.shadows.dark.chart,
      },
      zen: {
        default: tokens.shadows.light.zen,
        _dark: tokens.shadows.dark.zen,
      },
      btnDefault: {
        default: tokens.shadows.light.btnDefault,
        _dark: tokens.shadows.dark.btnDefault,
      },
      btnDefaultActive: {
        default: tokens.shadows.light.btnDefaultActive,
        _dark: tokens.shadows.dark.btnDefaultActive,
      },
      btnTertiary: {
        default: tokens.shadows.light.btnTertiary,
        _dark: tokens.shadows.dark.btnTertiary,
      },
      fontDefault: {
        default: tokens.shadows.light.fontDefault,
        _dark: tokens.shadows.dark.fontDefault,
      },
      fontLight: {
        default: tokens.shadows.light.fontLight,
        _dark: tokens.shadows.dark.fontLight,
      },
      fontDark: {
        default: tokens.shadows.light.fontDark,
        _dark: tokens.shadows.dark.fontDark,
      },
      input: {
        innerBase: {
          default: tokens.shadows.light.input.innerBase,
          _dark: tokens.shadows.dark.input.innerBase,
        },
        innerFocus: {
          default: tokens.shadows.light.input.innerFocus,
          _dark: tokens.shadows.dark.input.innerFocus,
        },
        innerError: {
          default: tokens.shadows.light.input.innerError,
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
