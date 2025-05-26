import { SupportedChainId } from '@repo/lib/config/config.types'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useMemo } from 'react'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { Hex } from 'viem'
import {
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useStepsTransactionState } from '@repo/lib/modules/transactions/transaction-steps/useStepsTransactionState'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { SubmittingVote } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'
import { chunk } from 'lodash'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'

const submitVotesStepId = 'submit-votes'

function getStepId(idx: number) {
  return [submitVotesStepId, idx].join('_')
}

export function getVotesTransactionsStepIndex(stepId: string) {
  if (stepId.startsWith(submitVotesStepId)) {
    return Number(stepId.split('_')[1])
  }
  return undefined
}

export const CHUNK_SIZE = 8

export function chunkVotes(votes: SubmittingVote[]) {
  return chunk(votes, CHUNK_SIZE)
}

function getVotesForManyGauges(votes: SubmittingVote[]) {
  // Gauge Controller requires a fixed 8 Gauge Addresses
  // We take the first 8 Voting Gauges
  // If there's less than 8, fill the remaining with Zero Addresses
  const gaugeAddresses = votes.map(item => item.vote.gauge.address as Hex)
  const weights = votes.map(item => item.weight)

  const zeroAddresses: Hex[] = new Array(CHUNK_SIZE - gaugeAddresses.length).fill(
    '0x0000000000000000000000000000000000000000' // ZeroAddress
  )
  const zeroWeights: string[] = new Array(CHUNK_SIZE - gaugeAddresses.length).fill('0')

  return {
    gaugeAddresses: [...gaugeAddresses, ...zeroAddresses],
    weights: [...weights, ...zeroWeights].map(weight => BigInt(weight)),
  }
}

export function useSubmitVotesSteps(
  chainId: SupportedChainId,
  votes: SubmittingVote[]
): {
  isLoading: boolean
  steps: TransactionStep[]
} {
  const { userAddress, isConnected } = useUserAccount()
  const { getTransaction, setTransactionFn } = useStepsTransactionState()

  const gaugeControllerAddress = mainnetNetworkConfig.contracts.gaugeController as Hex

  const isLoading = false

  const steps = useMemo(
    (): TransactionStep[] => {
      const chunks = chunkVotes(votes)

      return chunks.map((votesChunk, idx) => {
        const labels: TransactionLabels = {
          title: `Vote for ${votesChunk.length} pool gauges`,
          description: 'Confirming votes',
          init: 'Confirm votes',
          confirming: 'Confirming votes...',
          confirmed: 'Votes confirmed',
          tooltip: 'Confirm votes',
        }

        const { gaugeAddresses, weights } = getVotesForManyGauges(votesChunk)

        const txSimulationMeta = sentryMetaForWagmiSimulation(
          'Error in wagmi tx simulation: Submit votes',
          {
            idx,
            gaugeControllerAddress,
            gaugeAddresses,
            weights,
            userAddress,
            chainId,
          }
        )

        const stepId = getStepId(idx)
        const transaction = getTransaction(stepId)

        const props: ManagedTransactionInput = {
          contractAddress: gaugeControllerAddress,
          contractId: 'balancer.gaugeControllerAbi',
          functionName: 'vote_for_many_gauge_weights', // test tx: 0xf57f05f6f75040faaf2fdbf783c314e84907fa82a3a36312a34ec90c7b5d9e95
          labels,
          chainId,
          args: [gaugeAddresses, weights],
          enabled: !!userAddress && !isLoading,
          txSimulationMeta,
          onTransactionChange: setTransactionFn(stepId),
        }

        return {
          id: stepId,
          stepType: 'voteForManyGaugeWeights',
          labels,
          isComplete: () => isConnected && isTransactionSuccess(transaction),
          renderAction: () => <ManagedTransactionButton id={stepId} {...props} />,
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isConnected, isLoading, votes]
  )

  return {
    isLoading,
    steps,
  }
}
