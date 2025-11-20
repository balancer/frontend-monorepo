'use client'

import { PropsWithChildren, useEffect } from 'react'
import { useNavbarHeight } from '../../hooks/useNavbarHeight'

/**
 * Provider that sets the navbar height as a CSS variable
 * This allows server components to access the dynamic navbar height
 * without needing to be client components themselves
 */
export function NavbarHeightProvider({ children }: PropsWithChildren) {
  const navbarHeight = useNavbarHeight()

  useEffect(() => {
    document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`)
  }, [navbarHeight])

  return (
    <div style={{ '--navbar-height': `${navbarHeight}px` } as React.CSSProperties}>{children}</div>
  )
}
