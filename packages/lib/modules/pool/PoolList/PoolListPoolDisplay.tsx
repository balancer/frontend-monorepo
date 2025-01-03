import { ExpandedPoolInfo } from '../../portfolio/PortfolioTable/useExpandedPools'
import { PoolListDisplayType, PoolListItem } from '../pool.types'
import { PoolListPoolName } from './PoolListPoolName'
import { PoolListTokenPills } from './PoolListTokenPills'

export function PoolListPoolDisplay({
  displayType,
  pool,
  name,
}: {
  displayType: PoolListDisplayType | undefined
  pool: PoolListItem | ExpandedPoolInfo
  name: string | undefined
}) {
  let component

  switch (displayType) {
    case PoolListDisplayType.Name:
      component = <PoolListPoolName pool={pool} />
      break
    case PoolListDisplayType.TokenPills:
    default:
      component = (
        <PoolListTokenPills
          h={['32px', '36px']}
          iconSize={name ? 24 : 20}
          nameSize="sm"
          p={['xxs', 'sm']}
          pool={pool}
          pr={[1.5, 'ms']}
        />
      )
      break
  }

  return component
}
