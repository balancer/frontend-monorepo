'use client'

import { Box } from '@chakra-ui/react'
import { BeetsLandingHeroImg } from './components/BeetsLandingHeroImg'
import { LandingBalancerV3Section } from './sections/LandingBalancerV3Section'
import { LandingBeetsData } from './sections/LandingBeetsData'
import { LandingBeetsHero } from './sections/LandingBeetsHero'
import { LandingBeetsSecuritySection } from './sections/LandingBeetsSecuritySection'
import { LandingBeetsSocialClub } from './sections/LandingBeetsSocialClub'
import { LandingBeetsStakedSonic } from './sections/LandingBeetsStakedSonic'
import { LandingMaBeetsSection } from './sections/LandingMaBeetsSection'
import {
  GetProtocolStatsQuery,
  GetStakedSonicDataQuery,
} from '@repo/lib/shared/services/api/generated/graphql'

export function LandingPageLayout({
  protocolData,
  stakedSonicData,
}: {
  protocolData: GetProtocolStatsQuery
  stakedSonicData: GetStakedSonicDataQuery
}) {
  return (
    <Box position="relative">
      <BeetsLandingHeroImg />
      <LandingBeetsHero />
      <LandingBeetsData protocolData={protocolData} stakedSonicData={stakedSonicData} />
      <Box mb="2xl" mt="3xl" pb="3xl" pt="2xl">
        <LandingBeetsStakedSonic />
      </Box>
      <Box mb="2xl" pb="3xl">
        <LandingBalancerV3Section />
      </Box>
      <Box mb="2xl" pb="3xl">
        <LandingMaBeetsSection />
      </Box>
      <Box mb="2xl" pb="3xl">
        <LandingBeetsSecuritySection />
      </Box>
      <LandingBeetsSocialClub />
    </Box>
  )
}
