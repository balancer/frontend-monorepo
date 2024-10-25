import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { VebalLockDataProvider } from '@repo/lib/modules/vebal/lock/VebalLockDataProvider'

export const metadata: Metadata = {
  title: 'Balancer DeFi Liquidity Pools',
  description: `
    Explore DeFi liquidity pools or create your own.
    Provide liquidity to accumulate yield from swap fees
    while retaining your token exposure as prices move.
  `,
}

export default async function Pools({ children }: PropsWithChildren) {
  return <VebalLockDataProvider>{children}</VebalLockDataProvider>
}
