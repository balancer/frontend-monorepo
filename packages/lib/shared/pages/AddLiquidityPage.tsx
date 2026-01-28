'use client'

import { PoolActionsLayout } from '@repo/lib/modules/pool/actions/PoolActionsLayout'
import { AddLiquidityForm } from '@repo/lib/modules/pool/actions/add-liquidity/form/AddLiquidityForm'

type Props = {
  redirectPath?: string
}

export function AddLiquidityPage({ redirectPath }: Props = {}) {
  // ./layout.tsx defines UI and state that is shared by this page and the nested /add-liquidity/[txHash] receipt page
  return (
    <PoolActionsLayout redirectPath={redirectPath}>
      <AddLiquidityForm />
    </PoolActionsLayout>
  )
}
