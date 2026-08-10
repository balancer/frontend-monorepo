import { PropsWithChildren } from 'react'
import NextTopLoader from 'nextjs-toploader'
import { NavBarContainer } from '@bal/lib/components/navs/NavBarContainer'
import { BalancerLogoType } from '@bal/lib/components/imgs/BalancerLogoType'
import { Footer } from '@repo/lib/shared/components/navs/Footer'

export function BaseLayout({ children }: PropsWithChildren) {
  return (
    <>
      <NextTopLoader color="#7f6ae8" showSpinner={false} />
      <NavBarContainer />
      {children}
      <Footer
        logoType={<BalancerLogoType />}
        subTitle="Balancer is a battle-tested toolkit for true AMM experimentation and innovation."
        title="AMMs made easy"
      />
    </>
  )
}
