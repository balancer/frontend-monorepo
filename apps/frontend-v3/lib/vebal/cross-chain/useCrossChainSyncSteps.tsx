import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { Address } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { useEstimateSendUserBalance } from '@bal/lib/vebal/cross-chain/useEstimateSendUserBalance'
import { Button } from '@chakra-ui/react'
import { getChainShortName, getNetworkConfig } from '@repo/lib/config/app.config'
import { useStepsTransactionState } from '@repo/lib/modules/transactions/transaction-steps/useStepsTransactionState'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

export const crossChainSyncStepPrefix = 'cross-chain-sync'

export interface CrossChainSyncStepsProps {
  networks: GqlChain[]
}

function ChainSyncButton({
  omniVotingEscrow,
  layerZeroChainId,
  stepId,
  network,
  onTransactionChange,
}: {
  omniVotingEscrow: Address
  layerZeroChainId: number
  stepId: string
  network: GqlChain
  onTransactionChange: (transaction: ManagedResult) => void
}) {
  const { chainId } = useNetworkConfig()
  const { data, error, isLoading } = useEstimateSendUserBalance(omniVotingEscrow, layerZeroChainId)
  const { userAddress } = useUserAccount()

  // FIXME: (votes) handle error
  if (error) {
    return <Button disabled>Failed: {error.message}</Button>
  }

  if (!data) {
    return <Button isLoading={isLoading}>Loading</Button>
  }

  const nativeFee = BigInt(data.nativeFee.toString())

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Cross Chain Sync transaction)',
    {
      userAddress,
      layerZeroChainId,
      stepId,
      chainId,
    }
  )

  // FIX: actual labels
  const labels: TransactionLabels = {
    tooltip: `Sync veBAL to ${getChainShortName(network)}`,
    init: `Sync veBAL to ${getChainShortName(network)}`,
    title: `Sync veBAL to ${getChainShortName(network)}`,
    description: `Sync veBAL to ${getChainShortName(network)}`,
    confirming: `Syncing veBAL to ${getChainShortName(network)}`,
    confirmed: `Synced to ${getChainShortName(network)}`,
  }

  const props: ManagedTransactionInput = {
    contractId: 'balancer.omniVotingEscrowAbi',
    chainId,
    functionName: 'sendUserBalance',
    contractAddress: omniVotingEscrow,
    enabled: Boolean(nativeFee),
    txSimulationMeta,
    args: [userAddress, layerZeroChainId, userAddress],
    labels,
    onTransactionChange,
  }

  return <ManagedTransactionButton id={stepId} {...props} />
}

export function useCrossChainSyncSteps({ networks }: CrossChainSyncStepsProps): TransactionStep[] {
  const { userAddress } = useUserAccount()
  const { getTransaction, setTransactionFn } = useStepsTransactionState()

  const { contracts } = getNetworkConfig(GqlChain.Mainnet)

  return networks
    .filter(network => {
      const networkConfig = getNetworkConfig(network)
      return Boolean(networkConfig.layerZeroChainId)
    })
    .map(network => {
      const stepId = `${crossChainSyncStepPrefix}-${network}`

      const transaction = getTransaction(stepId)

      const isComplete = () => userAddress && isTransactionSuccess(transaction)

      const networkConfig = getNetworkConfig(network)

      // FIX: actual labels
      const labels: TransactionLabels = {
        init: 'Sync',
        title: `Sync veBAL to ${getChainShortName(network)}`,
        description: 'description - Cross Chain Sync.',
        confirming: 'confirming - Cross Chain Sync...',
        confirmed: 'confirmed - Cross Chain Sync!',
        tooltip: 'tooltip - Cross Chain Sync',
      }
      const layerZeroChainId = networkConfig.layerZeroChainId

      if (!layerZeroChainId) {
        throw new Error('layerZeroChainId is not defined')
      }

      const omniVotingEscrow = contracts.omniVotingEscrow

      if (!omniVotingEscrow) {
        throw new Error('omniVotingEscrow contract address is not defined')
      }

      const renderAction = () => (
        <ChainSyncButton
          key={stepId}
          layerZeroChainId={layerZeroChainId}
          network={network}
          omniVotingEscrow={omniVotingEscrow}
          onTransactionChange={setTransactionFn(stepId)}
          stepId={stepId}
        />
      )

      return {
        id: stepId,
        stepType: 'crossChainSync',
        labels,
        transaction,
        isComplete,
        renderAction,
      }
    })
}
