'use client'

import { useNavData } from './useNavData'
import { NavBar, NavActions } from '@repo/lib/shared/components/navs/NavBar'
import { NavLogo } from './NavLogo'
import { MobileNav } from '@repo/lib/shared/components/navs/MobileNav'
import { useNav } from '@repo/lib/shared/components/navs/useNav'
import { BeetsLogoType } from '../imgs/BeetsLogoType'
import { Box, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { fadeIn } from '@repo/lib/shared/utils/animations'
import { MaBeetsNavLink } from './MaBeetsNavLink'
import { SonicMigrationLink } from './SonicMigrationLink'
import { FantomToSonicSvg } from '../imgs/FantomToSonicSvg'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function NavBarContainer() {
  const { appLinks, ecosystemLinks, getSocialLinks } = useNavData()
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
      socialLinks={getSocialLinks(PROJECT_CONFIG.externalLinks.discordUrl)}
    />
  )

  return (
    <NavBar
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
      rightSlot={<NavActions hideDarkModeToggle mobileNav={mobileNav} />}
    />
  )
}
