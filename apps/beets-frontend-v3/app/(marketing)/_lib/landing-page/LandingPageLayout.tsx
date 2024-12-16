import { LandingBeetsData } from './sections/LandingBeetsData'
import { LandingBeetsHero } from './sections/LandingBeetsHero'
import { LandingBeetsSocialClub } from './sections/LandingBeetsSocialClub'
import { LandingBeetsStakedSonic } from './sections/LandingBeetsStakedSonic'
import { LandingMaBeetsSection } from './sections/LandingMaBeetsSection'

export function LandingPageLayout() {
  return (
    <>
      <LandingBeetsHero />
      <LandingBeetsData />
      <LandingBeetsStakedSonic />
      <LandingBeetsSocialClub />
      <LandingMaBeetsSection />
    </>
  )
}
