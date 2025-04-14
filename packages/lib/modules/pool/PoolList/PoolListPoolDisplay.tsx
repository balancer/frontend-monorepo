import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ExpandedPoolInfo } from '../../portfolio/PortfolioTable/useExpandedPools'
import { PoolDisplayType, PoolListItem } from '../pool.types'
//import { PoolListPoolName } from './PoolListPoolName'
import { PoolListTokenPills } from './PoolListTokenPills'

export function PoolListPoolDisplay({
  pool,
  name,
}: {
  pool: PoolListItem | ExpandedPoolInfo
  name: string | undefined
}) {
  let component

  switch (PROJECT_CONFIG.options.poolDisplayType) {
    // commented out until an app wants to show pool names again
    // case PoolDisplayType.Name:
    //   component = <PoolListPoolName pool={pool} />
    //   break
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
