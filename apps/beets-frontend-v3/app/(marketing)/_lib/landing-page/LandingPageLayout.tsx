import React from 'react'
import { LandingBeetsHero } from './sections/LandingBeetsHero'
import { LandingBeetsData } from './sections/LandingBeetsData'
import { Token } from './sections/Token'
import { LandingBeetsSocialClub } from './sections/LandingBeetsSocialClub'
import { LandingMaBeetsSection } from './sections/LandingMaBeetsSection'
import { LandingBeetsStakedSonic } from './sections/LandingBeetsStakedSonic'

export function LandingPageLayout() {
  return (
    <>
      <LandingBeetsHero />
      <LandingBeetsData />
      <LandingBeetsStakedSonic />
      <LandingBeetsSocialClub />
      <LandingMaBeetsSection />
      <Token />
    </>
  )
}
