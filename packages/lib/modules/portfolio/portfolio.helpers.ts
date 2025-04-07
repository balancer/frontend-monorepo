import { ExpandedPoolType } from './PortfolioTable/useExpandedPools'

export function getStakingText(poolType: ExpandedPoolType) {
  switch (poolType) {
    case ExpandedPoolType.StakedBal:
    case ExpandedPoolType.StakedAura:
      return 'Staked'
    case ExpandedPoolType.Unstaked:
      return 'Unstaked'
    case ExpandedPoolType.Locked:
      return 'Locked'
    case ExpandedPoolType.Unlocked:
      return 'Unlocked'
    default:
      return 'N/A'
  }
}
