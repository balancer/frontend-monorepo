import { useEffect, useState } from 'react'

// The usage of mounted helps to overcome nextjs hydration mismatch
// errors where the state of the user on the server pass is different
// than the state on the client side rehydration.
export function useIsMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // We disable the linting here because there is no other way
    // to check if a component is already mounted (and avoid the hydration
    // mismatch). The new versions of useIsMounted that try to do it
    // with a ref don't work for this problem (they are designed to prevent
    // memory leaks) as they will not re-render the component on change.
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  return mounted
}
