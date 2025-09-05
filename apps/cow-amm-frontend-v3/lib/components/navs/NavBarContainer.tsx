'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { NavBar } from '@repo/lib/shared/components/navs/NavBar'
import { NavLogo } from './NavLogo'
import { MobileNav } from '@repo/lib/shared/components/navs/MobileNav'
import { useNav } from '@repo/lib/shared/components/navs/useNav'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { CowAmmLogoType } from 'lib/components/imgs/CowAmmLogoType'

export function NavBarContainer() {
  const { defaultAppLinks } = useNav()

  const {
    links: { appLinks, ecosystemLinks, socialLinks },
    options: { allowCreateWallet },
  } = PROJECT_CONFIG

  const allAppLinks = [...defaultAppLinks, ...appLinks].map((link, index) => ({
    ...link,
    isExternal: index > 0 || link.isExternal,
  }))

  console.log({ allAppLinks })

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
          mobileNav={
            <MobileNav
              appLinks={allAppLinks}
              ecosystemLinks={ecosystemLinks}
              LogoType={CowAmmLogoType}
              socialLinks={socialLinks}
            />
          }
          navLogo={<NavLogo />}
        />
      </motion.div>
    </AnimatePresence>
  )
}
