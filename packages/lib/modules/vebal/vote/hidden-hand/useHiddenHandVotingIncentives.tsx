import { useQuery } from '@tanstack/react-query'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { getHiddenHandVotingIncentives } from '@repo/lib/modules/vebal/vote/hidden-hand/getHiddenHandVotingIncentives'

export function useHiddenHandVotingIncentives(timestamp?: number) {
  const queryKey = ['hidden-hand-voting-incentives', timestamp] as const

  const queryFn = async () => getHiddenHandVotingIncentives(timestamp)

  return useQuery({
    queryKey,
    queryFn,
    ...onlyExplicitRefetch,
  })
}
