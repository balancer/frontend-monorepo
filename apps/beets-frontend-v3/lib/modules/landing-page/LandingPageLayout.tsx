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
  GetProtocolStatsPerChainQuery,
  GetProtocolStatsQuery,
} from '@repo/lib/shared/services/api/generated/graphql'

export function LandingPageLayout({
  protocolData,
  protocolDataPerChain,
}: {
  protocolData: GetProtocolStatsQuery
  protocolDataPerChain: GetProtocolStatsPerChainQuery[]
}) {
  return (
    <Box position="relative">
      <BeetsLandingHeroImg />
      <LandingBeetsHero />
      <LandingBeetsData protocolData={protocolData} protocolDataPerChain={protocolDataPerChain} />
      <Box mb="2xl" mt="2xl" pb="3xl">
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
