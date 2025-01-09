import { mins } from '@repo/lib/shared/utils/time'
import {
  HiddenHandData,
  HiddenHandIncentives,
} from '@repo/lib/shared/services/hidden-hand/hidden-hand.types'

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
      throw new Error('Invalid incentives response: ' + JSON.stringify(incentives))
    }

    return incentives.data
  } catch (error) {
    console.error('Unable to fetch hidden hand incentives', error)
    throw error
  }
}

/**
 * Runs getHiddenHandVotingIncentives and wraps result in [data, error]
 *
 * @see https://dev.to/milos192/error-handling-with-the-either-type-2b63
 * @param timestamp
 */
export async function getHiddenHandVotingIncentivesEither(timestamp?: number) {
  return getHiddenHandVotingIncentives(timestamp)
    .then(data => [data, undefined] as const)
    .catch((error: unknown) => [undefined, error] as const)
}
