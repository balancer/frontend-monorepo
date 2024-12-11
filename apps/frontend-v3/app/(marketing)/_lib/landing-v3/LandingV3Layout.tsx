import { Hero } from './Hero'
import { Code } from './Code'
import { Videos } from './Videos'
import { Audits } from './Audits'
import { Grants } from './Grants'
import { Grow } from './Grow'
import { Contracts } from './Contracts'
import { Features } from './Features'
import { FooterCta } from './FooterCta'
import { GetProtocolStatsQuery } from '@repo/lib/shared/services/api/generated/graphql'

export function LandingV3Layout({ protocolData }: { protocolData: GetProtocolStatsQuery }) {
  return (
    <>
      <Hero />
      <Code />
      <Contracts />
      <Features />
      <Grow protocolData={protocolData} />
      <Audits />
      <Videos />
      <Grants />
      <FooterCta />
    </>
  )
}
