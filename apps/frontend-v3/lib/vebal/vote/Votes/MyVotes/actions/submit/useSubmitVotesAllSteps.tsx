import { useSubmitVotesSteps } from '@bal/lib/vebal/vote/Votes/MyVotes/actions/submit/useSubmitVotesSteps'
import mainnetNetworkConfig from '@repo/lib/config/networks/mainnet'
import { SubmittingVote } from '@bal/lib/vebal/vote/Votes/MyVotes/MyVotesProvider'

type Params = {
  votes: SubmittingVote[]
}

export function useSubmitVotesAllSteps({ votes }: Params) {
  const { steps, isLoading } = useSubmitVotesSteps(mainnetNetworkConfig.chainId, votes)

  return {
    isLoadingSteps: isLoading,
    steps,
  }
}
