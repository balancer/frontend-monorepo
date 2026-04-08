import { Box, Divider, Heading, HStack, Link, Stack, Text, VStack } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { useLbpPoolCharts } from '../../../LbpDetail/LbpPoolCharts/LbpPoolChartsProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { isAfter } from 'date-fns'
import { Address } from 'viem'
import { getBlockExplorerAddressUrl } from '@repo/lib/shared/utils/blockExplorer'
import { abbreviateAddress } from '@repo/lib/shared/utils/addresses'
import { LbpV3 } from '@repo/lib/modules/pool/pool.types'

export function LbpPoolAttributes({ pool }: { pool: LbpV3 }) {
  const token = pool.poolTokens[pool.projectTokenIndex]
  const { now: currentTime, currentPrice, hasSnapshots, snapshots } = useLbpPoolCharts()
  const hasEnded = hasSnapshots && isAfter(currentTime, snapshots[snapshots.length - 1].timestamp)

  const attributes = [
    {
      title: 'LBP creator',
      value: abbreviateAddress(pool.poolCreator as Address),
      link: getBlockExplorerAddressUrl(pool.poolCreator as Address, pool.chain),
    },
    {
      title: 'Available user actions',
      value: `Users can ${pool.isProjectTokenSwapInBlocked ? 'only buy' : 'buy and sell'} the sale token`,
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
