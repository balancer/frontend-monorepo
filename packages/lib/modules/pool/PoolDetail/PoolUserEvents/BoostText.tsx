import { useVebalBoost } from '@repo/lib/modules/vebal/useVebalBoost'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { useMemo } from 'react'
import { Pool } from '../../PoolProvider'
import { Text } from '@chakra-ui/react'

export interface BoostTextProps {
  pool: Pool
}

export function BoostText({ pool }: BoostTextProps) {
  const { veBalBoostMap } = useVebalBoost([pool])

  const boost = useMemo(() => {
    const boost = veBalBoostMap[pool.id]

    if (!boost || boost === '1') {
      return '1.00'
    }

    return fNum('boost', bn(boost))
  }, [veBalBoostMap, pool])

  return (
    <>
      <Text fontSize="0.85rem" variant="secondary">
        &middot;
      </Text>
      <Text fontSize="0.85rem" variant="secondary">
        {`${boost}x boost`}
      </Text>
    </>
  )
}
