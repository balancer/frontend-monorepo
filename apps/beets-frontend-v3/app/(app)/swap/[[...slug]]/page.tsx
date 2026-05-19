import { SwapForm } from '@repo/lib/modules/swap/SwapForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Swap tokens on Beets',
  description: `Swap tokens on Sonic via the Beets decentralized exchange`,
}

export default function SwapPage() {
  return <SwapForm />
}
