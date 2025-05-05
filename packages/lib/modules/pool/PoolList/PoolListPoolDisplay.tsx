import { ExpandedPoolInfo } from '../../portfolio/PortfolioTable/useExpandedPools'
import { PoolDisplayType, PoolListItem } from '../pool.types'
import { PoolListPoolName } from './PoolListPoolName'
import { PoolListTokenPills } from './PoolListTokenPills'

export function PoolListPoolDisplay({
  pool,
  name,
  poolDisplayType,
}: {
  pool: PoolListItem | ExpandedPoolInfo
  name: string | undefined
  poolDisplayType: PoolDisplayType
}) {
  let component

  switch (poolDisplayType) {
    case PoolDisplayType.Name:
      component = <PoolListPoolName pool={pool} />
      break
    case PoolDisplayType.TokenPills:
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
