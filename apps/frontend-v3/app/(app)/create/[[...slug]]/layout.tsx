import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { isProd } from '@repo/lib/config/app.config'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Balancer DeFi Liquidity Pool Creation',
  description: `
    Create a new DeFi liquidity pool on Balancer.
  `,
}

export default async function Layout({ children }: PropsWithChildren) {
  if (isProd) redirect('/')
  return <>{children}</>
}
