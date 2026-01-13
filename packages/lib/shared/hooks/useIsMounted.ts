import { useDeferredValue, useSyncExternalStore } from 'react'

// https://tkdodo.eu/blog/avoiding-hydration-mismatches-with-use-sync-external-store
// The new versions of useIsMounted (e.g. usehooks-ts) that try to do it
// with a ref don't work for this problem (they are designed to prevent
// memory leaks) as they will not re-render the component on change.
export function useIsMounted() {
  const isClient = useSyncExternalStore(
    () => () => {}, // noop
    () => true, // Client
    () => false // Server
  )

  return useDeferredValue(isClient)
}
