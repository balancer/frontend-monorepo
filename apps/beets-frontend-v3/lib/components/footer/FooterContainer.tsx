import { BeetsLogoType } from '../imgs/BeetsLogoType'
import { useNavData } from '../navs/useNavData'
import { useFooterData } from './useFooterData'
import { Footer } from '@repo/lib/shared/components/navs/Footer'

export function FooterContainer() {
  const { linkSections, legalLinks } = useFooterData()
  const { getSocialLinks } = useNavData()

  return (
    <Footer
      legalLinks={legalLinks}
      linkSections={linkSections}
      logoType={<BeetsLogoType />}
      socialLinks={getSocialLinks()}
      subTitle="Beets is your ultimate destination for liquid-staked tokens, real yield, and AMM innovation."
      title="The Hub for LSTs"
    />
  )
}
