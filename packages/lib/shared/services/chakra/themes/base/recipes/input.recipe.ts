import { defineRecipe } from '@chakra-ui/react'

export const inputRecipe = defineRecipe({
  base: {
    shadow: 'input.innerBase',
    border: '1px solid',
    borderColor: 'input.borderDefault',
    color: 'input.fontDefault',
    fontWeight: 'medium',
    px: '3',
    '&::placeholder': {
      color: 'input.fontPlaceholder',
    },
    _hover: {
      bg: 'input.bgHover',
      borderColor: 'input.borderHover',
    },
    _focus: {
      border: '1px solid',
      bg: 'input.bgFocus',
      borderColor: 'input.borderFocus',
      color: 'white',
      shadow: 'input.innerFocus',
    },
    _focusVisible: {
      color: 'input.fontFocus',
      border: '1px solid',
      borderColor: 'input.borderFocus',
      shadow: 'input.innerFocus',
    },
    _invalid: {
      border: '1px solid',
      borderColor: 'input.borderError',
      bg: 'input.bgError',
      shadow: 'input.innerError',
      color: 'input.fontError',
    },
    _disabled: {
      shadow: 'none',
      _hover: {
        bg: 'input.bgHoverDisabled',
        borderColor: 'input.borderDefault',
      },
    },
  },
  variants: {
    variant: {
      outline: {
        _focusVisible: {
          borderColor: 'input.borderFocus',
          boxShadow: 'input.innerFocus',
        },
      },
      search: {
        border: '1px solid',
        borderColor: 'input.border',
      },
    },
  },
})
