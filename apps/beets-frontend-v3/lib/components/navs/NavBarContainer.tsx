'use client'

import { NavBar, NavActions } from '@repo/lib/shared/components/navs/NavBar'
import { NavLogo } from './NavLogo'
import { MobileNav } from '@repo/lib/shared/components/navs/MobileNav'
import { useNav } from '@repo/lib/shared/components/navs/useNav'
import { BeetsLogoType } from '../imgs/BeetsLogoType'
import { Box, HStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { fadeIn } from '@repo/lib/shared/utils/animations'
import { MaBeetsNavLink } from './MaBeetsNavLink'
import { SonicMigrationLink } from './SonicMigrationLink'
import { FantomToSonicSvg } from '../imgs/FantomToSonicSvg'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function NavBarContainer() {
  const {
    links: { appLinks, ecosystemLinks, socialLinks },
    options: { allowCreateWallet },
  } = PROJECT_CONFIG
  const { defaultAppLinks } = useNav()
  const allAppLinks = [...defaultAppLinks, ...appLinks]

  const mobileNav = (
    <MobileNav
      LogoType={BeetsLogoType}
      appLinks={allAppLinks}
      customLinks={
        <>
          <MaBeetsNavLink fontSize="xl" />
          <SonicMigrationLink
            fontSize="xl"
            triggerEl={
              <HStack>
                <Box>Migrate to Sonic</Box>
                <FantomToSonicSvg height={24} />
              </HStack>
            }
          />
        </>
      }
      ecosystemLinks={ecosystemLinks}
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
          customLinks={
            <>
              <Box as={motion.div} variants={fadeIn}>
                <MaBeetsNavLink />
              </Box>
              <Box as={motion.div} variants={fadeIn}>
                <SonicMigrationLink />
              </Box>
            </>
          }
          navLogo={<NavLogo />}
          rightSlot={<NavActions mobileNav={mobileNav} />}
        />
      </motion.div>
    </AnimatePresence>
  )
}
