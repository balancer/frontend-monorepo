import { InputGroup, Input, InputRightElement, IconButton, InputProps } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useDebounce } from '@/lib/shared/hooks/useDebounce'
import { defaultDebounceMs } from '@/lib/shared/utils/queries'
import { Search, X } from 'react-feather'

interface SearchInputProps {
  search: string | null
  setSearch: (search: string) => void
  placeholder: string
  ariaLabel: string
  isLoading?: boolean
}

const SEARCH = 'search'

export function SearchInput({
  search,
  setSearch,
  placeholder,
  ariaLabel,
  isLoading,
  ...rest
}: SearchInputProps & InputProps) {
  const { register, setValue, getFieldState } = useForm()

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const debouncedChangeHandler = useDebounce(changeHandler, defaultDebounceMs)

  return (
    <InputGroup size="md">
      <Input
        {...register(SEARCH)}
        id={SEARCH}
        autoComplete="off"
        placeholder={placeholder}
        onChange={debouncedChangeHandler}
        bg="input.bgDefault"
        border="1px solid"
        borderColor="input.borderDefault"
        _hover={{ bg: 'input.bgHover', borderColor: 'input.borderHover' }}
        _focus={{
          bg: 'input.bgFocus',
          borderColor: 'input.borderFocus',
        }}
        _focusVisible={{
          bg: 'input.bgFocus',
          borderColor: 'input.borderFocus',
          shadow: 'input.innerFocus',
          color: 'input.fontFocus',
        }}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault()
          }
        }}
        {...rest}
      />
      <InputRightElement>
        <IconButton
          variant="ghost"
          size="sm"
          color="font.secondary"
          opacity="0.5"
          aria-label={ariaLabel}
          icon={search ? <X size="20" /> : <Search size="20" />}
          _hover={{
            opacity: '1',
            background: 'background.level1',
            color: 'font.maxContrast',
          }}
          onClick={() => {
            setSearch('')
            setValue(SEARCH, '')
          }}
          isLoading={isLoading && getFieldState(SEARCH).isTouched}
        />
      </InputRightElement>
    </InputGroup>
  )
}
