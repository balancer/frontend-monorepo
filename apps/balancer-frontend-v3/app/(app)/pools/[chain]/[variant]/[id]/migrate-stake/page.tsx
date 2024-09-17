'use client'

import { PoolActionsLayout } from '@/lib/modules/pool/actions/PoolActionsLayout'
import { MigrateStakeForm } from '@/lib/modules/pool/actions/migrateStake/MigrateStakeForm'
import { MigrateStakeProvider } from '@/lib/modules/pool/actions/migrateStake/MigrateStakeProvider'
import { UnstakeProvider } from '@/lib/modules/pool/actions/unstake/UnstakeProvider'
import { TransactionStateProvider } from '@/lib/modules/transactions/transaction-steps/TransactionStateProvider'

export default function MigrateStakePage() {
  return (
    <TransactionStateProvider>
      <UnstakeProvider>
        <MigrateStakeProvider>
          <PoolActionsLayout>
            <MigrateStakeForm />
          </PoolActionsLayout>
        </MigrateStakeProvider>
      </UnstakeProvider>
    </TransactionStateProvider>
  )
}
