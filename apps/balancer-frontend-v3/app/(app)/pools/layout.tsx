import { getProjectConfig } from '@/lib/config/getProjectConfig'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

const { projectName } = getProjectConfig()

export const metadata: Metadata = {
  title: `${projectName} DeFi Liquidity Pools`,
  description: `
    Explore DeFi liquidity pools or create your own.
    Provide liquidity to accumulate yield from swap fees
    while retaining your token exposure as prices move.
  `,
}

export default async function Pools({ children }: PropsWithChildren) {
  return <>{children}</>
}
