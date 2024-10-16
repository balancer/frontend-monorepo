'use client'

import { useNavData } from './useNavData'
import { NavBar } from '@repo/lib/shared/components/navs/NavBar'
import { NavLogo } from './NavLogo'
import { MobileNav } from '@repo/lib/shared/components/navs/MobileNav'
import { useNav } from '@repo/lib/shared/components/navs/useNav'

export function NavBarContainer() {
  const { appLinks, ecosystemLinks, getSocialLinks } = useNavData()
  const { defaultAppLinks } = useNav()
  const allAppLinks = [...defaultAppLinks, ...appLinks]
  return (
    <NavBar
      appLinks={allAppLinks}
      navLogo={<NavLogo />}
      mobileNav={
        <MobileNav
          appLinks={allAppLinks}
          ecosystemLinks={ecosystemLinks}
          socialLinks={getSocialLinks()}
        />
      }
    />
  )
}
