import { useFeeManager } from '@repo/lib/modules/fee-managers/useFeeManager'
import { usePool } from '../../PoolProvider'
import { EzklPromoBanner } from '@repo/lib/shared/components/promos/EzklPromoBanner'

export function PoolFeeManagerBanner() {
  const { pool } = usePool()
  const { hasFeeManager, feeManager } = useFeeManager(pool)

  if (!hasFeeManager) return null

  if (feeManager?.id === 'fee_manager_ezkl') {
    return <EzklPromoBanner />
  } else {
    return null
  }
}
