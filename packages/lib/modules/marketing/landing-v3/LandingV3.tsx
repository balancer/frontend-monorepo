// import { Hero } from './v1/Hero'
import { Build } from './v2/Build'
import { Hero as HeroV2 } from './v2/Hero'
import { Code } from './v2/Code'
import { Videos } from './v2/Videos'
import { Audits } from './v2/Audits'
import { Grants } from './v2/Grants'

export function LandingV3() {
  return (
    <>
      <HeroV2 />
      <Code />
      <Build />
      <Videos />
      <Audits />
      <Grants />
    </>
  )
}