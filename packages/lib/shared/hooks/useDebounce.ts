/* eslint-disable react-hooks/preserve-manual-memoization */
import { debounce } from 'lodash'
import { useMemo } from 'react'

export function useDebounce(changeHandler: (...args: any) => any, debounceMilliseconds = 300) {
  const debouncedChangeHandler = useMemo(() => debounce(changeHandler, debounceMilliseconds), [])
  return debouncedChangeHandler
}
