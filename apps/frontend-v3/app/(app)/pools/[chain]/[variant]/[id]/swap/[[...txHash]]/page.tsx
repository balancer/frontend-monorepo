'use client'

import { PoolSwapPage } from '@repo/lib/shared/pages/PoolSwapPage'

type Props = {
  params: { txHash?: string[] }
}
// Page for swapping from a pool page
export default function PoolSwapPageWrapper({ params: { txHash } }: Props) {
  return <PoolSwapPage txHash={txHash} />
}
