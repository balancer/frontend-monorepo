'use client'

import { NavBar, NavActions } from '@repo/lib/shared/components/navs/NavBar'
import { NavLogo } from './NavLogo'
import { MobileNav } from '@repo/lib/shared/components/navs/MobileNav'
import { useNav } from '@repo/lib/shared/components/navs/useNav'
import { BeetsLogoType } from '../imgs/BeetsLogoType'
import { AnimatePresence, motion } from 'framer-motion'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isDev, isStaging } from '@repo/lib/config/app.config'

export function NavBarContainer() {
  const {
    links: { appLinks, ecosystemLinks, socialLinks },
    options: { allowCreateWallet },
  } = PROJECT_CONFIG
  const { defaultAppLinks } = useNav()

  const allAppLinks = [
    ...defaultAppLinks,
    ...appLinks,
    // TODO: remove here when loops goes live
    ...(isDev || isStaging ? [{ href: '/loops', label: 'Loop $S' }] : []),
  ]

  const mobileNav = (
    <MobileNav
      appLinks={allAppLinks}
      ecosystemLinks={ecosystemLinks}
      LogoType={BeetsLogoType}
      socialLinks={socialLinks}
    />
  )

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <NavBar
          allowCreateWallet={allowCreateWallet}
          appLinks={allAppLinks}
          navLogo={<NavLogo />}
          rightSlot={<NavActions mobileNav={mobileNav} />}
        />
      </motion.div>
    </AnimatePresence>
  )
}
