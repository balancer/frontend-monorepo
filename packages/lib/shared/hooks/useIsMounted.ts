import { useEffect, useState } from 'react'

// The usage of mounted helps to overcome nextjs hydration mismatch
// errors where the state of the user on the server pass is different
// than the state on the client side rehydration.
export function useIsMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
