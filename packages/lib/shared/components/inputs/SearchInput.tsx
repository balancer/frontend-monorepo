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
          borderColor: 'input.borderFocus',
        }}
        _focusVisible={{
          borderColor: 'input.borderFocus',
          color: 'input.fontFocus',
        }}
        _hover={{ borderColor: 'input.borderFocus' }}
        autoComplete="off"
        bg="rgba(5, 5, 18, 0.65)"
        boxShadow=" inset 0 0 0 1px rgba(0, 255, 233, 0.35),  /* crisp stroke */
    inset 0 0 30px rgba(0, 255, 233, 0.20); "
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
