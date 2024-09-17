import { debounce } from 'lodash'
import { useMemo } from 'react'

export function useDebounce(changeHandler: (...args: any) => any, debounceMilliseconds = 300) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeHandler = useMemo(() => debounce(changeHandler, debounceMilliseconds), [])
  return debouncedChangeHandler
}
