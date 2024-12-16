import { LandingBeetsData } from './sections/LandingBeetsData'
import { LandingBeetsHero } from './sections/LandingBeetsHero'
import { LandingBeetsSocialClub } from './sections/LandingBeetsSocialClub'
import { LandingBeetsStakedSonic } from './sections/LandingBeetsStakedSonic'
import { LandingMaBeetsSection } from './sections/LandingMaBeetsSection'
import { LandingBalancerV3Section } from './sections/LandingBalancerV3Section'
import { LandingBeetsSecuritySection } from './sections/LandingBeetsSecuritySection'

export function LandingPageLayout() {
  return (
    <>
      <LandingBeetsHero />
      <LandingBeetsData />
      <LandingBeetsStakedSonic />
      <LandingBalancerV3Section />
      <LandingMaBeetsSection />
      <LandingBeetsSecuritySection />
      <LandingBeetsSocialClub />
    </>
  )
}
