import { ChakraStylesConfig } from 'chakra-react-select'

type Variant = 'default' | 'gradient'

const defaultStyles = <T>(): ChakraStylesConfig<T> => ({
  container: provided => ({
    ...provided,
    width: 'full',
    cursor: 'pointer',
    rounded: 'md',
    fontWeight: 'medium',
    background: 'background.level3',
    zIndex: 9,
  }),
  control: provided => ({
    ...provided,
    background: 'transparent',
    shadow: 'md',
    borderColor: 'background.level3',
    rounded: 'md',
    _hover: {
      background: 'transparent',
    },
    _focus: {
      background: 'transparent',
      boxShadow: '0px 0px 0px 1px var(--chakra-colors-purple-500)',
    },
    _focusVisible: {
      background: 'transparent',
      boxShadow: '0px 0px 0px 1px var(--chakra-colors-purple-500)',
    },
  }),
  menuList: provided => ({
    ...provided,
    background: 'background.level4',
    borderColor: 'border.base',
    rounded: 'md',
    shadow: 'lg',
  }),
  option: provided => ({
    ...provided,
    background: 'background.level4',
    _hover: {
      background: 'background.level3',
    },
    _active: {
      background: 'background.level3',
    },
    _selected: {
      background: 'background.level0',
      fontWeight: 'bold',
    },
  }),
  indicatorSeparator: provided => ({
    ...provided,
    display: 'none',
  }),
  dropdownIndicator: provided => ({
    ...provided,
    background: 'background.level3',
    paddingLeft: '0',
  }),
})

const gradientStyles = <T>(): ChakraStylesConfig<T> => ({
  container: provided => ({
    ...provided,
    background: 'gradient.dawnDark',
    rounded: 'md',
    zIndex: 9,
    fontWeight: 'medium',
    _focus: {
      background: 'gradient.dawnDark',
    },
  }),
  control: provided => ({
    ...provided,
    background: 'transparent',
    shadow: 'sm',
    borderColor: 'transparent',
    rounded: 'md',
    color: 'font.dark',
    paddingRight: '0',
    marginRight: '0',
    _hover: {
      background: 'transparent',
    },
    _focus: {
      background: 'transparent',
      boxShadow: '0px 0px 0px 1px var(--chakra-colors-purple-500)',
    },
    _focusVisible: {
      background: 'transparent',
      boxShadow: '0px 0px 0px 1px var(--chakra-colors-purple-500)',
    },
  }),
  menuList: provided => ({
    ...provided,
    background: 'background.level4',
    borderColor: 'border.base',
    rounded: 'md',
    shadow: 'lg',
  }),
  option: provided => ({
    ...provided,
    background: 'background.level4',
    _hover: {
      background: 'background.level3',
    },
    _active: {
      background: 'background.level3',
    },
    _selected: {
      background: 'background.level0',
      fontWeight: 'bold',
    },
  }),
  indicatorSeparator: provided => ({
    ...provided,
    display: 'none',
  }),
  dropdownIndicator: provided => ({
    ...provided,
    background: 'transparent',
    paddingLeft: 'xs',
  }),
})

export function getSelectStyles<T>(variant?: Variant): ChakraStylesConfig<T> {
  switch (variant) {
    case 'default':
      return defaultStyles()
    case 'gradient':
      return gradientStyles()
    default:
      return defaultStyles()
  }
}
