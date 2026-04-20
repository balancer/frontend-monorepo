import { PoolsNetworkWatcher } from '@/lib/components/navs/PoolsNetworkWatcher'
import { NuqsAppAdapter } from '@repo/lib/shared/components/site/NuqsAppAdapter'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Beets DeFi Liquidity Pools',
  description: `
    Fuel your liquidity.
    Earn yield from swap fees, incentives, and more.
    Create and customize pools tailored to your strategy.
  `,
}

export default async function Pools({ children }: PropsWithChildren) {
  return (
    <NuqsAppAdapter>
      {children}
      <PoolsNetworkWatcher />
    </NuqsAppAdapter>
  )
}
