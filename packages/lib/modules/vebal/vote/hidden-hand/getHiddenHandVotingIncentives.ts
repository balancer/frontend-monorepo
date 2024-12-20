import { mins } from '@repo/lib/shared/utils/time'
import {
  HiddenHandData,
  HiddenHandIncentives,
} from '@repo/lib/modules/vebal/vote/hidden-hand/hidden-hand.types'

const HIDDEN_HAND_PROPOSAL_BALANCER_API_URL = 'https://api.hiddenhand.finance/proposal/balancer'

export async function getHiddenHandVotingIncentives(timestamp?: number): Promise<HiddenHandData[]> {
  try {
    const res = await fetch(
      timestamp
        ? `${HIDDEN_HAND_PROPOSAL_BALANCER_API_URL}/${timestamp}`
        : HIDDEN_HAND_PROPOSAL_BALANCER_API_URL,
      {
        next: { revalidate: mins(1).toSecs() },
      }
    )

    const incentives = (await res.json()) as HiddenHandIncentives

    if (incentives.error) {
      throw incentives
    }

    return incentives.data
  } catch (error) {
    console.error('Unable to fetch hidden hand incentives', error)
    throw error
  }
}
