import React from 'react'
import { Hero } from './sections/Hero'
import { Data } from './sections/Data'
import { Token } from './sections/Token'
import { LandingBeetsSocialClub } from './sections/LandingBeetsSocialClub'
import { LandingMaBeetsSection } from './sections/LandingMaBeetsSection'
import { LandingBeetsStakedSonic } from './sections/LandingBeetsStakedSonic'

export function LandingPageLayout() {
  return (
    <>
      <Hero />
      <Data />
      <Token />
      <LandingBeetsSocialClub />
      <LandingMaBeetsSection />
      <LandingBeetsStakedSonic />
    </>
  )
}
