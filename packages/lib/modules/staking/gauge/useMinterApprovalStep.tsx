import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { useHasMinterApproval } from './useHasMinterApproval'
import { useState } from 'react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { ManagedTransactionButton } from '../../transactions/transaction-steps/TransactionButton'

const approveMinterStepId = 'approve-minter'
export function useApproveMinterStep(chain: GqlChain): {
  isLoading: boolean
  step: TransactionStep
} {
  const { isConnected } = useUserAccount()
  const [, setTransaction] = useState<ManagedResult | undefined>()

  const { contracts, chainId } = getNetworkConfig(chain)

  const { hasMinterApproval, isLoading, refetch } = useHasMinterApproval()

  const labels: TransactionLabels = {
    init: 'Approve relayer as minter',
    title: 'Approve minter',
    description: 'Approve relayer as minter',
    confirming: 'Confirming approval...',
    confirmed: `Relayer approved as minter!`,
    tooltip: 'Approval relayer as minter',
  }

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Minter approval transaction)',
    {
      minter: contracts.balancer.minter,
    }
  )

  const props: ManagedTransactionInput = {
    contractAddress: contracts.balancer.minter,
    contractId: 'balancer.minter',
    functionName: 'setMinterApproval',
    labels,
    chainId,
    args: [contracts.balancer.relayerV6, true],
    enabled: !isLoading && isConnected && !hasMinterApproval,
    txSimulationMeta,
    onTransactionChange: setTransaction,
  }

  const step: TransactionStep = {
    id: approveMinterStepId,
    stepType: 'minterApproval',
    labels,
    isComplete: () => isConnected && hasMinterApproval,
    renderAction: () => <ManagedTransactionButton id={approveMinterStepId} {...props} />,
    onSuccess: () => refetch(),
  }

  return {
    isLoading,
    step,
  }
}
