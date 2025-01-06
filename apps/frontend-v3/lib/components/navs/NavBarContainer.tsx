'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNavData } from './useNavData'
import { NavBar } from '@repo/lib/shared/components/navs/NavBar'
import { NavLogo } from './NavLogo'
import { MobileNav } from '@repo/lib/shared/components/navs/MobileNav'
import { useNav } from '@repo/lib/shared/components/navs/useNav'
import { BalancerLogoType } from '../imgs/BalancerLogoType'
import { VeBalLink } from '@repo/lib/modules/vebal/VebalRedirectModal'
import { Box } from '@chakra-ui/react'
import { fadeIn } from '@repo/lib/shared/utils/animations'

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
          customLinks={
            <Box as={motion.div} variants={fadeIn}>
              <VeBalLink />
            </Box>
          }
          mobileNav={
            <MobileNav
              LogoType={BalancerLogoType}
              appLinks={allAppLinks}
              customLinks={<VeBalLink fontSize="xl" />}
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
