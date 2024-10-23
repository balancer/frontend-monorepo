'use client'

import { useNavData } from './useNavData'
import { NavBar } from '@repo/lib/shared/components/navs/NavBar'
import { NavLogo } from './NavLogo'
import { MobileNav } from '@repo/lib/shared/components/navs/MobileNav'
import { useNav } from '@repo/lib/shared/components/navs/useNav'
import { BeetsLogoType } from '../imgs/BeetsLogoType'

export function NavBarContainer() {
  const { appLinks, ecosystemLinks, getSocialLinks } = useNavData()
  const { defaultAppLinks } = useNav()
  const allAppLinks = [...defaultAppLinks, ...appLinks]
  return (
    <NavBar
      appLinks={allAppLinks}
      mobileNav={
        <MobileNav
          LogoType={BeetsLogoType}
          appLinks={allAppLinks}
          ecosystemLinks={ecosystemLinks}
          socialLinks={getSocialLinks()}
        />
      }
      navLogo={<NavLogo />}
    />
  )
}
