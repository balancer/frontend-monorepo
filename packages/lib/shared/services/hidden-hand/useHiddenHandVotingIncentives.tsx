import { HiddenHandData } from '@repo/lib/shared/services/hidden-hand/hidden-hand.types'
import { RenameByT } from '../../utils/types.helpers'

export function useHiddenHandVotingIncentives() {
  return {
    incentives: [] as HiddenHandIncentives[],
    incentivesError: null,
    incentivesAreLoading: false,
  }
}

export type HiddenHandIncentives = RenameByT<{ bribes: 'incentives' }, HiddenHandData>
