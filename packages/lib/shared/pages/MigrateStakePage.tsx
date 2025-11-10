'use client'

import { PoolActionsLayout } from '@repo/lib/modules/pool/actions/PoolActionsLayout'
import { MigrateStakeForm } from '@repo/lib/modules/pool/actions/migrateStake/MigrateStakeForm'
import { MigrateStakeProvider } from '@repo/lib/modules/pool/actions/migrateStake/MigrateStakeProvider'
import { UnstakeProvider } from '@repo/lib/modules/pool/actions/unstake/UnstakeProvider'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { RelayerSignatureProvider } from '@repo/lib/modules/relayer/RelayerSignatureProvider'

export function MigrateStakePage() {
  return (
    <TransactionStateProvider>
      <RelayerSignatureProvider>
        <UnstakeProvider>
          <MigrateStakeProvider>
            <PoolActionsLayout>
              <MigrateStakeForm />
            </PoolActionsLayout>
          </MigrateStakeProvider>
        </UnstakeProvider>
      </RelayerSignatureProvider>
    </TransactionStateProvider>
  )
}
