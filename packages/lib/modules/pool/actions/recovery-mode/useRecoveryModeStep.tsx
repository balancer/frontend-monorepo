import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { usePool } from '../../PoolProvider'
import { useState } from 'react'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { ManagedSendTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { buildTenderlyUrl } from '@repo/lib/modules/web3/useTenderly'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { Address, encodeFunctionData, zeroAddress } from 'viem'
import { vaultAdminAbi_V3 } from '@balancer/sdk'
import { getNetworkConfig } from '@repo/lib/config/app.config'

const STEP_ID = 'enable-recovery'

export function useRecoveryModeStep() {
  const { userAddress } = useUserAccount()
  const { pool, chainId, refetch } = usePool()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const labels: TransactionLabels = {
    init: 'Enable recovery mode',
    title: 'Enable recovery mode',
    description: `Enable recovery mode for ${pool.name || 'pool'}.`,
    confirming: 'Confirming enabling recovery mode...',
    confirmed: `Recovery mode enabled!`,
    tooltip: `Enable recovery mode for ${pool.name || 'pool'}.`,
    poolId: pool.id,
  }

  const networkConfig = getNetworkConfig(chainId)

  const txConfig: TransactionConfig = {
    account: userAddress,
    chainId: chainId,
    data: encodeFunctionData({
      abi: vaultAdminAbi_V3,
      functionName: 'enableRecoveryMode',
      args: [pool.address as Address],
    }),
    to: networkConfig.contracts.balancer.vaultV3 || zeroAddress,
  }

  return {
    id: STEP_ID,
    stepType: 'enableRecovery',
    labels,
    transaction,
    isComplete: () => isTransactionSuccess(transaction),
    onSuccess: refetch,
    renderAction: () => {
      return (
        <ManagedSendTransactionButton
          gasEstimationMeta={buildSentryMeta(txConfig)}
          id={STEP_ID}
          labels={labels}
          onTransactionChange={setTransaction}
          txConfig={txConfig}
        />
      )
    },
  } as TransactionStep
}

function buildSentryMeta(txConfig: TransactionConfig) {
  return sentryMetaForWagmiSimulation('Error in Enable Recovery gas estimation', {
    simulationQueryData: txConfig,
    buildCallQueryData: txConfig,
    tenderlyUrl: buildTenderlyUrl({ txConfig }),
  })
}
