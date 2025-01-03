import { usePathname } from 'next/navigation'
import { useParams } from 'next/navigation'
import { ReactNode } from 'react'

export type AppLink = {
  href: string
  label?: string
  icon?: ReactNode
  isExternal?: boolean
}

export function useNav() {
  const pathname = usePathname()
  const { chain } = useParams()
  const swapHref = chain ? '/swap/' + chain : '/swap'

  const defaultAppLinks: AppLink[] = [
    {
      href: '/pools',
      label: 'Pools',
    },
    {
      href: swapHref,
      label: 'Swap',
    },
    {
      href: '/portfolio',
      label: 'Portfolio',
    },
  ]

  function linkColorFor(path: string) {
    return pathname === path ? 'font.highlight' : 'font.primary'
  }

  return { defaultAppLinks, linkColorFor }
}
