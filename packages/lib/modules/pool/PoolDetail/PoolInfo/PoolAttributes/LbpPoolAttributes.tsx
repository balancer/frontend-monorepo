import { Box, Heading, HStack, Link, Stack, Text, VStack, Separator } from '@chakra-ui/react';
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
      link: getBlockExplorerAddressUrl(lbpPool.poolCreator as Address, pool.chain) },
    {
      title: 'Available user actions',
      value: `Users can ${lbpPool.isProjectTokenSwapInBlocked ? 'only buy' : 'buy and sell'} the sale token` },
    {
      title: hasEnded ? `${token.symbol} price at the end of LBP` : `${token.symbol} spot price`,
      value: `$${fNum('fiat', currentPrice, { forceThreeDecimals: true })}` },
  ]

  return (
    <>
      <Separator />
      <Heading fontSize="1rem" variant="h4">
        LBP details
      </Heading>
      <VStack width="full">
        {attributes.map(attribute => {
          return (
            <Stack
              direction={{ base: 'column', md: 'row' }}
              key={`pool-attribute-${attribute.title}`}
              gap={{ base: 'xxs', md: 'xl' }}
              width="full"
            >
              <Box minWidth="160px">
                <Text variant="secondary">{attribute.title}:</Text>
              </Box>
              {attribute.link ? (
                <Link
                  href={attribute.link}
                  variant="link"
                  target='_blank'
                  rel='noopener noreferrer'>
                  <HStack gap="xxs">
                    <Text color="link">{attribute.value}</Text>
                    <ArrowUpRight size={12} />
                  </HStack>
                </Link>
              ) : (
                <Text mb={{ base: 'sm', md: '0' }} variant="secondary">
                  {attribute.value}
                </Text>
              )}
            </Stack>
          );
        })}
      </VStack>
    </>
  );
}
