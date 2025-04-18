import { usePool } from '../../PoolProvider'
import { QuantAMMPromoBanner } from '@repo/lib/shared/components/promos/QuantAMMPromoBanner'
import { isQuantAmmPool } from '../../pool.helpers'

export function PoolQuantAMMBanner() {
  const { pool } = usePool()

  return isQuantAmmPool(pool.type) ? <QuantAMMPromoBanner /> : null
}
