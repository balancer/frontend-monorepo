import { useQuery } from '@tanstack/react-query'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { mins } from '@repo/lib/shared/utils/time'
import {
  HiddenHandData,
  HiddenHandResponse,
} from '@repo/lib/shared/services/hidden-hand/hidden-hand.types'
import { RenameByT } from '../../utils/types.helpers'

const HIDDEN_HAND_PROPOSAL_BALANCER_API_URL = 'https://api.hiddenhand.finance/proposal/balancer'

export function useHiddenHandVotingIncentives(timestamp?: number) {
  const queryKey = ['hidden-hand-voting-incentives', timestamp] as const

  const queryFn = async () => getHiddenHandVotingIncentives(timestamp)

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn,
    ...onlyExplicitRefetch,
  })
  console.log({ hiddenHandQuery: { data, isLoading, error } })

  return {
    incentives: [] as HiddenHandIncentives[],
    incentivesError: null,
    incentivesAreLoading: false,
  }
}

export type HiddenHandIncentives = RenameByT<{ bribes: 'incentives' }, HiddenHandData>

async function getHiddenHandVotingIncentives(timestamp?: number): Promise<HiddenHandIncentives[]> {
  try {
    const res = await fetch(
      timestamp
        ? `${HIDDEN_HAND_PROPOSAL_BALANCER_API_URL}/${timestamp}`
        : HIDDEN_HAND_PROPOSAL_BALANCER_API_URL,
      {
        next: { revalidate: mins(1).toSecs() },
      }
    )

    const incentives = (await res.json()) as HiddenHandResponse

    if (incentives.error) {
      throw new Error('Invalid incentives response: ' + JSON.stringify(incentives))
    }

    return incentives.data.map(info => {
      return {
        ...info,
        incentives: info.bribes,
      }
    })
  } catch (error) {
    console.error('Unable to fetch hidden hand incentives', error)
    throw error
  }
}
