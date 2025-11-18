import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { isProd } from '@repo/lib/config/app.config'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Beets DeFi Liquidity Pool Creation',
  description: `
    Create a new DeFi liquidity pool on Beets.
  `,
}

export default async function Create({ children }: PropsWithChildren) {
  if (isProd) redirect('/')
  return <>{children}</>
}
