import { Hero } from './Hero'
import { HomeHero } from './HomeHero'
import { Code } from './Code'
import { Videos } from './Videos'
import { Audits } from './Audits'
import { Grow } from './Grow'
import { Contracts } from './Contracts'
import { Features } from './Features'
import { FooterCta } from './FooterCta'

export function LandingV3Layout() {
  return (
    <>
      <HomeHero />
      <Hero />
      <Code />
      <Contracts />
      <Features />
      <Grow />
      <Videos />
      <Audits />
      <FooterCta />
    </>
  )
}
