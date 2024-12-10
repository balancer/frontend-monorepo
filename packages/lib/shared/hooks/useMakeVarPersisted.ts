// adapted from https://github.com/apollographql/apollo-cache-persist/issues/361#issuecomment-912545495

'use client'

import { makeVar } from '@apollo/client'
import { useRef } from 'react'
import { useLocalStorage } from 'usehooks-ts'

export function useMakeVarPersisted<T>(
  initialValue: T,
  storageName: string,
  shouldDiscardPersistedValue = false
) {
  const [value, setValue] = useLocalStorage(storageName, initialValue)

  const isInitialized = useRef(false)

  const shouldLoadInitialValue = !isInitialized.current && shouldDiscardPersistedValue
  if (!isInitialized.current) {
    isInitialized.current = true
  }
  /*
    Create a reactive var with stored/initial value
    If shouldDiscardPersistedValue is true, discard the persisted value on first render
  */
  const rv = shouldLoadInitialValue ? makeVar(initialValue) : makeVar(value)

  const onNextChange = (newValue: T | undefined) => {
    try {
      // Try to add the value to local storage
      if (newValue === undefined) {
        localStorage.removeItem(storageName)
      } else {
        setValue(newValue)
      }
    } catch {
      // ignore
    }

    // Re-register for the next change
    rv.onNextChange(onNextChange)
  }

  // Register for the first change
  rv.onNextChange(onNextChange)

  return rv
}
