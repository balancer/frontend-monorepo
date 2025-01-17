import {
  SubmittingVote,
  useMyVotes,
} from '@repo/lib/modules/vebal/vote/Votes/MyVotes/MyVotesProvider'
import {
  chunkVotes,
  getVotesTransactionsStepIndex,
} from '@repo/lib/modules/vebal/vote/Votes/MyVotes/actions/submit/useSubmitVotesSteps'
import { useMemo } from 'react'
import { sumBy } from 'lodash'
import { bn } from '@repo/lib/shared/utils/numbers'

export interface VotesChunksAllocation {
  count: number
  weight: number
}

export function useSubmittingVotes() {
  const { transactionSteps, submittingVotes } = useMyVotes()

  const submittingVotesChunks = useMemo(() => {
    return chunkVotes(submittingVotes)
  }, [submittingVotes])

  const currentStepVotesTransactionsIndex = transactionSteps.currentStep?.id
    ? getVotesTransactionsStepIndex(transactionSteps.currentStep.id)
    : undefined

  const { previousChunksAllocation, nextChunksAllocation, submittingVotesChunk } = useMemo<{
    previousChunksAllocation: VotesChunksAllocation | undefined
    nextChunksAllocation: VotesChunksAllocation | undefined
    submittingVotesChunk: SubmittingVote[]
  }>(() => {
    if (typeof currentStepVotesTransactionsIndex !== 'number') {
      return {
        previousChunksAllocation: undefined,
        nextChunksAllocation: undefined,
        submittingVotesChunk: [],
      }
    }

    const [previousVotesChunks, nextVotesChunks] = [
      submittingVotesChunks.slice(0, currentStepVotesTransactionsIndex),
      submittingVotesChunks.slice(currentStepVotesTransactionsIndex + 1),
    ]

    return {
      previousChunksAllocation:
        previousVotesChunks.length > 0
          ? {
              count: previousVotesChunks.length,
              weight: sumBy(previousVotesChunks.flat(), vote => bn(vote.weight).toNumber()),
            }
          : undefined,
      nextChunksAllocation:
        nextVotesChunks.length > 0
          ? {
              count: nextVotesChunks.length,
              weight: sumBy(nextVotesChunks.flat(), vote => bn(vote.weight).toNumber()),
            }
          : undefined,
      submittingVotesChunk: submittingVotesChunks[currentStepVotesTransactionsIndex],
    }
  }, [submittingVotesChunks, currentStepVotesTransactionsIndex])

  return {
    submittingVotesChunk,
    previousChunksAllocation,
    nextChunksAllocation,
  }
}
