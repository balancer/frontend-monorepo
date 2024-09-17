// adapted from https://github.com/apollographql/apollo-cache-persist/issues/361#issuecomment-912545495

'use client'

import { makeVar } from '@apollo/client'
import { useLocalStorage } from 'usehooks-ts'

export function useMakeVarPersisted<T>(initialValue: T, storageName: string) {
  const [value, setValue] = useLocalStorage(storageName, initialValue)

  // Create a reactive var with stored/initial value
  const rv = makeVar(value)

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
