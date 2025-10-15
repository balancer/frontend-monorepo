import { usePathname } from 'next/navigation'
import { useParams } from 'next/navigation'
import { ReactNode } from 'react'
import { IconType } from './SocialIcon'

export type AppLink = {
  href?: string
  label?: string
  icon?: ReactNode
  isExternal?: boolean
  iconType?: IconType
  analyticsEvent?: string
  onClick?: () => void
}

export function useNav() {
  const pathname = usePathname()
  const { chain } = useParams()
  const swapHref = chain ? '/swap/' + chain : '/swap'

  const defaultAppLinks: AppLink[] = [
    {
      analyticsEvent: 'ClickNavPools',
      href: '/pools',
      label: 'Pools',
    },
    {
      analyticsEvent: 'ClickNavSwap',
      href: swapHref,
      label: 'Swap',
    },
    {
      analyticsEvent: 'ClickNavPortfolio',
      href: '/portfolio',
      label: 'Portfolio',
    },
  ]

  function linkColorFor(path: string) {
    return pathname === path ? 'font.highlight' : 'font.primary'
  }

  return { defaultAppLinks, linkColorFor }
}
