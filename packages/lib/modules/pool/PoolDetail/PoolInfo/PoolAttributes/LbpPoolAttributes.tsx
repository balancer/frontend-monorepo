import { Box, Divider, Heading, HStack, Link, Stack, Text, VStack } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { Pool } from '../../../pool.types'
import { useLbpPoolCharts } from '../../../LbpDetail/LbpPoolCharts/LbpPoolChartsProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { isAfter } from 'date-fns'
import { Address } from 'viem'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/utils/blockExplorer'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'

export function LbpPoolAttributes({ pool }: { pool: Pool }) {
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const token = lbpPool.poolTokens[lbpPool.projectTokenIndex]
  const { now: currentTime, currentPrice, hasSnapshots, snapshots } = useLbpPoolCharts()
  const hasEnded = hasSnapshots && isAfter(currentTime, snapshots[snapshots.length - 1].timestamp)

  const attributes = [
    {
      title: 'LBP creator',
      value: abbreviateAddress(lbpPool.poolCreator as Address),
      link: getBlockExplorerAddressUrl(lbpPool.poolCreator as Address, pool.chain),
    },
    {
      title: 'Available user actions',
      value: `Users can ${lbpPool.isProjectTokenSwapInBlocked ? 'buy and sell' : 'only buy'} the sale token`,
    },
    {
      title: hasEnded ? `${token.symbol} price at the end of LBP` : `${token.symbol} spot price`,
      value: `$${fNum('fiat', currentPrice, { forceThreeDecimals: true })}`,
    },
  ]

  return (
    <>
      <Divider />

      <Heading fontSize="1rem" variant="h4">
        LBP details
      </Heading>

      <VStack width="full">
        {attributes.map(attribute => {
          return (
            <Stack
              direction={{ base: 'column', md: 'row' }}
              key={`pool-attribute-${attribute.title}`}
              spacing={{ base: 'xxs', md: 'xl' }}
              width="full"
            >
              <Box minWidth="160px">
                <Text variant={{ base: 'primary', md: 'secondary' }}>{attribute.title}:</Text>
              </Box>
              {attribute.link ? (
                <Link href={attribute.link} isExternal variant="link">
                  <HStack gap="xxs">
                    <Text color="link">{attribute.value}</Text>
                    <ArrowUpRight size={12} />
                  </HStack>
                </Link>
              ) : (
                <Text mb={{ base: 'sm', md: '0' }} variant={{ base: 'secondary', md: 'secondary' }}>
                  {attribute.value}
                </Text>
              )}
            </Stack>
          )
        })}
      </VStack>
    </>
  )
}
