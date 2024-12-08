'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNavData } from './useNavData'
import { NavBar } from '@repo/lib/shared/components/navs/NavBar'
import { NavLogo } from './NavLogo'
import { MobileNav } from '@repo/lib/shared/components/navs/MobileNav'
import { useNav } from '@repo/lib/shared/components/navs/useNav'
import { BalancerLogoType } from '../imgs/BalancerLogoType'

export function NavBarContainer() {
  const { appLinks, ecosystemLinks, getSocialLinks } = useNavData()
  const { defaultAppLinks } = useNav()
  const allAppLinks = [...defaultAppLinks, ...appLinks]

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <NavBar
          appLinks={allAppLinks}
          mobileNav={
            <MobileNav
              LogoType={BalancerLogoType}
              appLinks={allAppLinks}
              ecosystemLinks={ecosystemLinks}
              socialLinks={getSocialLinks()}
            />
          }
          navLogo={<NavLogo />}
        />
      </motion.div>
    </AnimatePresence>
  )
}
