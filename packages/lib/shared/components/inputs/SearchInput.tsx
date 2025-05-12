import { InputGroup, Input, InputRightElement, IconButton, InputProps } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useDebounce } from '@repo/lib/shared/hooks/useDebounce'
import { defaultDebounceMs } from '@repo/lib/shared/utils/queries'
import { Search, X } from 'react-feather'
import { useEffect } from 'react'

interface SearchInputProps {
  search: string | null
  setSearch: (search: string) => void
  placeholder: string
  ariaLabel: string
  isLoading?: boolean
  autoFocus?: boolean
}

const SEARCH = 'search'

export function SearchInput({
  search,
  setSearch,
  placeholder,
  ariaLabel,
  isLoading,
  autoFocus = true,
  ...rest
}: SearchInputProps & InputProps) {
  const { register, setValue, getFieldState, setFocus } = useForm()

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const debouncedChangeHandler = useDebounce(changeHandler, defaultDebounceMs)

  useEffect(() => {
    if (autoFocus) setFocus(SEARCH)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus])

  return (
    <InputGroup size="md">
      <Input
        {...register(SEARCH)}
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
        _hover={{ bg: 'input.bgHover', borderColor: 'input.borderHover' }}
        autoComplete="off"
        bg="input.bgDefault"
        border="1px solid"
        borderColor="input.borderDefault"
        defaultValue={search ?? ''}
        id={SEARCH}
        onChange={debouncedChangeHandler}
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault()
          }
        }}
        placeholder={placeholder}
        {...rest}
      />
      <InputRightElement>
        <IconButton
          _hover={{
            opacity: '1',
            background: 'background.level1',
            color: 'font.maxContrast',
          }}
          aria-label={ariaLabel}
          color="font.secondary"
          icon={search ? <X size="20" /> : <Search size="20" />}
          isLoading={isLoading && getFieldState(SEARCH).isTouched}
          onClick={() => {
            setSearch('')
            setValue(SEARCH, '')
          }}
          opacity="0.5"
          size="sm"
          variant="ghost"
        />
      </InputRightElement>
    </InputGroup>
  )
}
