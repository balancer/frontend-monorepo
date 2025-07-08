import { Flex, Box } from '@chakra-ui/react'
import { usePoolStats } from '@repo/lib/modules/lbp/pool/usePoolStats'
import { AnimatedNumber } from '@repo/lib/shared/components/other/AnimatedNumber'
import Stat from '@repo/lib/shared/components/other/Stat'
import { safeToNumber } from '@repo/lib/shared/utils/numbers'
import { usePool } from '../../PoolProvider'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { hasSaleStarted } from '@repo/lib/modules/lbp/pool/lbp.helpers'

type StatItem = {
  label: string
  value?: string | number | undefined | null
}

const IMAGE_TRANSFORM_ARRAY = ['rotate(180deg) scale(2)', 'rotate(180deg)', 'scale(1)']

export function LbpHeaderStats() {
  const { pool } = usePool()
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const stats = usePoolStats(lbpPool)

  const statItems: StatItem[] = [
    { label: 'Funds raised', value: hasSaleStarted(lbpPool) ? stats.fundsRaised : 0 },
    { label: 'Market cap', value: hasSaleStarted(lbpPool) ? stats.marketCap : 0 },
    { label: 'FDV', value: hasSaleStarted(lbpPool) ? stats.fdv : 0 },
    { label: 'TVL', value: hasSaleStarted(lbpPool) ? stats.tvl : 0 },
    { label: 'Total vol', value: hasSaleStarted(lbpPool) ? stats.totalVolume : 0 },
    { label: 'Total fees', value: hasSaleStarted(lbpPool) ? stats.totalFees : 0 },
  ]

  const formatOptions = '$0,0.00a'

  return (
    <Flex
      direction="row"
      flexWrap="wrap"
      gap={{ base: 'sm', lg: 'ms' }}
      justify="space-between"
      mt="3"
    >
      {statItems.map((stat, index) => (
        <Box key={index}>
          <Stat
            imageTransform={IMAGE_TRANSFORM_ARRAY[index % IMAGE_TRANSFORM_ARRAY.length]}
            label={stat.label}
            value={
              <AnimatedNumber formatOptions={formatOptions} value={safeToNumber(stat.value)} />
            }
          />
        </Box>
      ))}
    </Flex>
  )
}
