import { LandingBeetsData } from './sections/LandingBeetsData'
import { LandingBeetsHero } from './sections/LandingBeetsHero'
import { LandingBeetsSocialClub } from './sections/LandingBeetsSocialClub'
import { LandingBeetsStakedSonic } from './sections/LandingBeetsStakedSonic'
import { LandingMaBeetsSection } from './sections/LandingMaBeetsSection'
import { LandingBalancerV3Section } from './sections/LandingBalancerV3Section'
import { LandingBeetsSecuritySection } from './sections/LandingBeetsSecuritySection'
import { Box } from '@chakra-ui/react'

export function LandingPageLayout() {
  return (
    <>
      <LandingBeetsHero />
      <LandingBeetsData />
      <Box pb="3xl" mb="2xl" mt="2xl">
        <LandingBeetsStakedSonic />
      </Box>
      <Box pb="3xl" mb="2xl">
        <LandingBalancerV3Section />
      </Box>
      <Box pb="3xl" mb="2xl">
        <LandingMaBeetsSection />
      </Box>
      <Box pb="3xl" mb="2xl">
        <LandingBeetsSecuritySection />
      </Box>
      <LandingBeetsSocialClub />
    </>
  )
}
