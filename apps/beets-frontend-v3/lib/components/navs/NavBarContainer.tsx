'use client'

import { useNavData } from './useNavData'
import { NavBar, NavActions } from '@repo/lib/shared/components/navs/NavBar'
import { NavLogo } from './NavLogo'
import { MobileNav } from '@repo/lib/shared/components/navs/MobileNav'
import { useNav } from '@repo/lib/shared/components/navs/useNav'
import { BeetsLogoType } from '../imgs/BeetsLogoType'
import { LzBeetsMigrator } from '@repo/lib/shared/components/btns/LzBeetsMigrator'

export function NavBarContainer() {
  const { appLinks, ecosystemLinks, getSocialLinks } = useNavData()
  const { defaultAppLinks } = useNav()
  const allAppLinks = [...defaultAppLinks, ...appLinks]

  const mobileNav = (
    <MobileNav
      LogoType={BeetsLogoType}
      appLinks={allAppLinks}
      ecosystemLinks={ecosystemLinks}
      socialLinks={getSocialLinks()}
    />
  )

  return (
    <NavBar
      appLinks={allAppLinks}
      navLogo={<NavLogo />}
      rightSlot={
        <>
          <LzBeetsMigrator />
          <NavActions hideDarkModeToggle mobileNav={mobileNav} />
        </>
      }
    />
  )
}
