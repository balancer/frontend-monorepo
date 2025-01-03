'use client'

import Link from 'next/link'
import { Container } from '@chakra-ui/react'
import { Prose } from '@nikolovlazar/chakra-ui-prose'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export default function Terms() {
  return (
    <Container>
      <Prose>
        <FadeInOnView>
          <div className="subsection">
            <h1>Beets Terms of service</h1>
            <p>
              <em>Last updated: February 2023</em>
            </p>
          </div>
        </FadeInOnView>
        <FadeInOnView>
          <div className="subsection">
            <h2>BeethovenX DAO Reliquary NFT Terms</h2>
            <h3>Protocol & Entity Participation.</h3>
            <p>
              Unless otherwise indicated, the defined and capitalized terms used below incorporate
              the same meaning as the terms used in the BeethovenX DAO LLC operating agreement (the
              “Agreement”), available{' '}
              <Link color="white" href="https://docs.beets.fi/operating-agreement" target="_blank">
                here
              </Link>
              . The NFT is referred to as the “Token” in the Agreement.
            </p>
            <p>
              By using this NFT to participate in the governance and operations of BeethovenX , the
              holder of this NFT agrees to be subject to the terms of the Agreement, including as a
              Member of its entity structure. BeethovenX formed a nonprofit LLC under the laws of
              the Republic of the Marshall Islands on <i>TBD</i>. Participation in the governance
              and operations of BeethovenX includes, but is not limited to, utilizing the NFT to:
              (1) vote on Proposals to become Governance Resolutions, (2) attend events and
              otherwise communicate with the BeethovenX community, and (3) interact with the Beets
              protocol.
            </p>
            <p>
              Except as otherwise provided in the Agreement, a Token Holder’s membership interest or
              rights thereunder in relation to this NFT are freely transferable to another person
              through its conveyance. Except as otherwise provided in the Agreement, a Member shall
              be deemed to have resigned from the BeethovenX DAO LLC upon the disposal or transfer
              of this NFT.
            </p>
          </div>
        </FadeInOnView>
      </Prose>
    </Container>
  )
}
