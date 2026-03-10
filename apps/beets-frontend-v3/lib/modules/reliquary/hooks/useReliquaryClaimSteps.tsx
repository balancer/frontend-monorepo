import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useMemo } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { useState } from 'react'
import {
  ManagedResult,
  TransactionLabels,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { useReliquary } from '../ReliquaryProvider'
import { getChainId } from '@repo/lib/config/app.config'

const claimStepId = 'reliquary-claim-rewards'

export function useReliquaryClaimSteps(relicId: string) {
  const { pool } = usePool()
  const { chain, pendingRewardsByRelicId, beetsPrice, pendingRewardsQuery } = useReliquary()
  const { userAddress } = useUserAccount()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const pendingRewardsAmount = pendingRewardsByRelicId[relicId] ?? '0'
  const pendingRewardsUsdValue = bn(pendingRewardsAmount).times(beetsPrice)

  const chainId = getChainId(chain)

  const labels: TransactionLabels = {
    init: 'Claim rewards',
    title: `Claim rewards from maBEETS #${relicId}`,
    description: `Claim pending BEETS rewards from maBEETS #${relicId}.`,
    confirming: 'Claiming rewards...',
    confirmed: 'Rewards claimed!',
    tooltip: `Claim pending BEETS rewards from maBEETS #${relicId}`,
    poolId: pool.id,
  }

  const isComplete = () => isTransactionSuccess(transaction)

  const props: ManagedTransactionInput = useMemo(
    () => ({
      enabled: !pendingRewardsUsdValue.lt(0.01) && !!userAddress,
      labels,
      chainId,
      contractId: 'beets.reliquary' as const,
      contractAddress: getNetworkConfig(chain).contracts.beets?.reliquary as string,
      functionName: 'harvest' as const,
      args: [BigInt(relicId), userAddress],
      onTransactionChange: setTransaction,
    }),
    [labels, pendingRewardsUsdValue, relicId, userAddress, setTransaction]
  )

  const claimStep: TransactionStep = useMemo(
    () => ({
      id: claimStepId,
      stepType: 'claim',
      labels,
      details: {
        gasless: false,
        type: 'Gas transaction',
      },
      transaction,
      isComplete,
      renderAction: () => <ManagedTransactionButton id={claimStepId} {...props} />,
    }),
    [transaction, pendingRewardsUsdValue, labels, isComplete, props]
  )

  return {
    isLoadingSteps: pendingRewardsQuery.isLoading,
    steps: [claimStep],
  }
}
