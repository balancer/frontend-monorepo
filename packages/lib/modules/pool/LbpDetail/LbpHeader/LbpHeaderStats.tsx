import { Flex, Box } from '@chakra-ui/react'
import { AnimatedNumber } from '@repo/lib/shared/components/other/AnimatedNumber'
import Stat from '@repo/lib/shared/components/other/Stat'
import { safeToNumber } from '@repo/lib/shared/utils/numbers'

type StatItem = {
  label: string
  value?: string | number | undefined | null
}

const IMAGE_TRANSFORM_ARRAY = ['rotate(180deg) scale(2)', 'rotate(180deg)', 'scale(1)']

export function LbpHeaderStats() {
  const stats: StatItem[] = [
    {
      label: 'Funds raised',
      value: '86400',
    },
    {
      label: 'Market cap',
      value: '6400000',
    },
    {
      label: 'FDV',
      value: '12800000',
    },
    {
      label: 'TVL',
      value: '102300',
    },
    {
      label: 'Total vol',
      value: '163300',
    },
    {
      label: 'Total fees',
      value: '3270',
    },
  ]

  const formatOptions = '$0,0.00a'

  return (
    <Flex
      direction="row"
      flexWrap="wrap"
      gap={{ base: 'sm', lg: 'ms' }}
      mt="3"
      justify="space-between"
    >
      {stats.map((stat, index) => (
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
