import { useQuery } from '@tanstack/react-query'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { getHiddenHandVotingIncentives } from '@repo/lib/shared/services/hidden-hand/getHiddenHandVotingIncentives'

export function useHiddenHandVotingIncentivesQuery(timestamp?: number) {
  const queryKey = ['hidden-hand-voting-incentives', timestamp] as const

  const queryFn = async () => getHiddenHandVotingIncentives(timestamp)

  return useQuery({
    queryKey,
    queryFn,
    ...onlyExplicitRefetch,
  })
}
