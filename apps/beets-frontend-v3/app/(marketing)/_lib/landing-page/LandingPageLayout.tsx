import { Box } from '@chakra-ui/react'
import { BeetsLandingHeroImg } from './components/BeetsLandingHeroImg'
import { LandingBalancerV3Section } from './sections/LandingBalancerV3Section'
import { LandingBeetsData } from './sections/LandingBeetsData'
import { LandingBeetsHero } from './sections/LandingBeetsHero'
import { LandingBeetsSecuritySection } from './sections/LandingBeetsSecuritySection'
import { LandingBeetsSocialClub } from './sections/LandingBeetsSocialClub'
import { LandingBeetsStakedSonic } from './sections/LandingBeetsStakedSonic'
import { LandingMaBeetsSection } from './sections/LandingMaBeetsSection'

export function LandingPageLayout() {
  return (
    <Box position="relative">
      <BeetsLandingHeroImg />
      <LandingBeetsHero />
      <LandingBeetsData />
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
