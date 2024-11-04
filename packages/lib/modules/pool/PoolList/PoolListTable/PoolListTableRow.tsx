import { Box, Grid, GridItem, GridProps, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { getPoolPath, getPoolTypeLabel } from '../../pool.utils'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { memo } from 'react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { PoolListItem } from '../../pool.types'
import { PoolListTokenPills } from '../PoolListTokenPills'
import { getUserTotalBalanceUsd } from '../../user-balance.helpers'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { usePoolList } from '../PoolListProvider'
import { PoolVersionTag } from '../../PoolVersionTag'

interface Props extends GridProps {
  pool: PoolListItem
  keyValue: number
}

const MemoizedMainAprTooltip = memo(MainAprTooltip)

export function PoolListTableRow({ pool, keyValue, ...rest }: Props) {
  const {
    queryState: { userAddress },
  } = usePoolList()
  const { toCurrency } = useCurrency()

  return (
    <FadeInOnView>
      <Box
        _hover={{
          bg: 'background.level0',
        }}
        key={keyValue}
        px={{ base: '0', sm: 'md' }}
        rounded="md"
        transition="all 0.2s ease-in-out"
        w="full"
      >
        <Link href={getPoolPath(pool)} prefetch>
          <Grid {...rest} pr="4" py={{ base: 'ms', md: 'md' }}>
            <GridItem>
              <NetworkIcon chain={pool.chain} size={6} />
            </GridItem>
            <GridItem>
              <PoolListTokenPills
                chain={pool.chain}
                displayTokens={pool.displayTokens}
                h={['32px', '36px']}
                iconSize={20}
                p={['xxs', 'sm']}
                pr={[1.5, 'ms']}
                type={pool.type}
              />
            </GridItem>
            <GridItem minW="32">
              <HStack>
                <PoolVersionTag pool={pool} />
                <Text fontWeight="medium" textAlign="left" textTransform="capitalize">
                  {getPoolTypeLabel(pool.type)}
                </Text>
              </HStack>
            </GridItem>
            {userAddress ? (
              <GridItem>
                <Text fontWeight="medium" textAlign="right">
                  {toCurrency(getUserTotalBalanceUsd(pool), { abbreviated: false })}
                </Text>
              </GridItem>
            ) : null}
            <GridItem>
              <Text
                fontWeight="medium"
                textAlign="right"
                title={toCurrency(pool.dynamicData.totalLiquidity, { abbreviated: false })}
              >
                {toCurrency(pool.dynamicData.totalLiquidity)}
              </Text>
            </GridItem>
            <GridItem textAlign="right">
              <Text
                fontWeight="medium"
                textAlign="right"
                title={toCurrency(pool.dynamicData.volume24h, { abbreviated: false })}
              >
                {toCurrency(pool.dynamicData.volume24h)}
              </Text>
            </GridItem>
            <GridItem justifySelf="end" pr={{ base: 'md', xl: '0' }}>
              <MemoizedMainAprTooltip
                aprItems={pool.dynamicData.aprItems}
                height="auto"
                pool={pool}
                poolId={pool.id}
                textProps={{ fontWeight: 'medium', textAlign: 'right' }}
              />
            </GridItem>
          </Grid>
        </Link>
      </Box>
    </FadeInOnView>
  )
}
