import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Beets DeFi Liquidity Pool Creation',
  description: `
    Create a new DeFi liquidity pool on Beets.
  `,
}

export default async function Create({ children }: PropsWithChildren) {
  return <>{children}</>
}
