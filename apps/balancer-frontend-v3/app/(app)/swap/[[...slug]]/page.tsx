/* eslint-disable max-len */

import { getProjectConfig } from '@/lib/config/getProjectConfig'
import { SwapForm } from '@/lib/modules/swap/SwapForm'
import { Metadata } from 'next'

const { projectName } = getProjectConfig()

export const metadata: Metadata = {
  title: `Swap tokens on ${projectName}`,
  description: `Swap tokens on networks like Ethereum, Optimism, Arbitrum and Base via the Balancer decentralized exchange`,
}

export default function SwapPage() {
  return <SwapForm />
}
