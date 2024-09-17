'use client'

import { PoolActionsLayout } from '@/lib/modules/pool/actions/PoolActionsLayout'
import { AddLiquidityForm } from '@/lib/modules/pool/actions/add-liquidity/form/AddLiquidityForm'

export default function AddLiquidityPage() {
  // ./layout.tsx defines UI and state that is shared by this page and the nested /add-liquidity/[txHash] receipt page
  return (
    <PoolActionsLayout>
      <AddLiquidityForm />
    </PoolActionsLayout>
  )
}
