'use client'

import { BalancerLogoType } from '../imgs/BalancerLogoType'
import { useNavData } from '../navs/useNavData'
import { useFooterData } from './useFooterData'
import { Footer } from '@repo/lib/shared/components/navs/Footer'
import { useProjectConfig } from '@repo/lib/config/ProjectConfigProvider'

export function FooterContainer() {
  const { linkSections, legalLinks } = useFooterData()
  const { getSocialLinks } = useNavData()
  const {
    externalLinks: { discordUrl },
  } = useProjectConfig()

  return (
    <Footer
      legalLinks={legalLinks}
      linkSections={linkSections}
      logoType={<BalancerLogoType />}
      socialLinks={getSocialLinks(discordUrl)}
      subTitle="Balancer is a battle-tested toolkit for true AMM experimentation and innovation."
      title="AMMs made easy"
    />
  )
}
