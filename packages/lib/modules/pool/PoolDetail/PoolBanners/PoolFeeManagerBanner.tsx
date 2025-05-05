import { useFeeManager } from '@repo/lib/modules/fee-managers/useFeeManager'
import { usePool } from '../../PoolProvider'
import { EzklPromoBanner } from '@repo/lib/shared/components/promos/EzklPromoBanner'
import { FeeManagersId } from '@repo/lib/modules/fee-managers/getFeeManagersMetadata'

export function PoolFeeManagerBanner() {
  const { pool } = usePool()
  const { hasFeeManager, feeManager } = useFeeManager(pool)

  if (!hasFeeManager) return null

  if (feeManager?.id === FeeManagersId.EZKL) {
    return <EzklPromoBanner />
  } else {
    return null
  }
}
