import { Hero } from './Hero'
import { Code } from './Code'
import { Videos } from './Videos'
import { Audits } from './Audits'
import { Grants } from './Grants'
import { Grow } from './Grow'
import { Contracts } from './Contracts'
import { Features } from './Features'
import { FooterCta } from './FooterCta'

export function LandingV3Layout() {
  return (
    <>
      <Hero />
      <Code />
      <Contracts />
      <Features />
      <Grow />
      <Audits />
      <Videos />
      <Grants />
      <FooterCta />
    </>
  )
}
