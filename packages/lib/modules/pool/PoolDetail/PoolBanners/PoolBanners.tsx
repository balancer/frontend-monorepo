import { PoolHookBanner } from './PoolHookBanner'
import { PoolFeeManagerBanner } from './PoolFeeManagerBanner'
import { PoolQuantAMMBanner } from './PoolQuantAMMBanner'

export function PoolBanners() {
  return (
    <>
      <PoolHookBanner />
      <PoolFeeManagerBanner />
      <PoolQuantAMMBanner />
    </>
  )
}
