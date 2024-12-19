'use client'

import { useNavData } from './useNavData'
import { NavBar, NavActions } from '@repo/lib/shared/components/navs/NavBar'
import { NavLogo } from './NavLogo'
import { MobileNav } from '@repo/lib/shared/components/navs/MobileNav'
import { useNav } from '@repo/lib/shared/components/navs/useNav'
import { BeetsLogoType } from '../imgs/BeetsLogoType'
import { LzBeetsMigrator } from '@repo/lib/shared/components/btns/LzBeetsMigrator'
import { Box, HStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { fadeIn } from '@repo/lib/shared/utils/animations'
import { MaBeetsNavLink } from './MaBeetsNavLink'
import { SonicMigrationLink } from './SonicMigrationLink'
import Image from 'next/image'
import { FantomToSonicSvg } from '../imgs/FantomToSonicSvg'
import { PoolsLink } from './PoolsLink'

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
      socialLinks={getSocialLinks()}
    />
  )

  return (
    <NavBar
      appLinks={allAppLinks.slice(1)} // we remove the pools link for the custom dropdown link
      customLinksAfter={
        <>
          <Box as={motion.div} variants={fadeIn}>
            <MaBeetsNavLink />
          </Box>
          <Box as={motion.div} variants={fadeIn}>
            <SonicMigrationLink />
          </Box>
        </>
      }
      customLinksBefore={
        <Box as={motion.div} variants={fadeIn}>
          <PoolsLink />
        </Box>
      }
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
