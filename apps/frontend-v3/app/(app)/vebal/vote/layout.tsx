import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'Vote and earn external incentives',
  description: `
    Voting on pool gauges helps to direct weekly BAL liquidity mining incentives.
    Voters are also eligible to earn additional 3rd party voting incentives.
  `,
}

export default async function Pools({ children }: PropsWithChildren) {
  return <>{children}</>
}
