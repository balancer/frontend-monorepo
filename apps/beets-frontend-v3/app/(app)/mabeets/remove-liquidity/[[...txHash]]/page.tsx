'use client'

import { RemoveLiquidityPage } from '@repo/lib/shared/pages/RemoveLiquidityPage'

type Props = {
  params: { txHash?: string[] }
}

export default function RemoveLiquidityWrapper({ params: { txHash } }: Props) {
  return <RemoveLiquidityPage redirectPath="/mabeets" txHash={txHash} />
}
