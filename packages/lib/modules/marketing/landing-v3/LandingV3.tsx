import { Hero as HeroV2 } from './v2/Hero'
import { Code } from './v2/Code'
import { Videos } from './v2/Videos'
import { Audits } from './v2/Audits'
import { Grants } from './v2/Grants'
import { Grow } from './v2/Grow'
import { Contracts } from './v2/Contracts'
import { Features } from './v2/Features'

export function LandingV3() {
  return (
    <>
      <HeroV2 />
      <Code />
      <Contracts />
      <Features />
      <Grow />
      <Audits />
      <Videos />
      <Grants />
    </>
  )
}
