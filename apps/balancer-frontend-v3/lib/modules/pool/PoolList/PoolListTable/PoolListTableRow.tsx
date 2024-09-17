import { Box, Grid, GridItem, GridProps, Text } from '@chakra-ui/react'
import Link from 'next/link'
import { getPoolPath, getPoolTypeLabel } from '../../pool.utils'
import MainAprTooltip from '@/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { memo } from 'react'
import { NetworkIcon } from '@/lib/shared/components/icons/NetworkIcon'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { usePoolListQueryState } from '../usePoolListQueryState'
import { PoolListItem } from '../../pool.types'
import { PoolListTokenPills } from '../PoolListTokenPills'
import { getUserTotalBalanceUsd } from '../../user-balance.helpers'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'

interface Props extends GridProps {
  pool: PoolListItem
  keyValue: number
}

const MemoizedMainAprTooltip = memo(MainAprTooltip)

export function PoolListTableRow({ pool, keyValue, ...rest }: Props) {
  const { userAddress } = usePoolListQueryState()
  const { toCurrency } = useCurrency()

  return (
    <FadeInOnView>
      <Box
        key={keyValue}
        transition="all 0.2s ease-in-out"
        _hover={{
          bg: 'background.level0',
        }}
        rounded="md"
        px={{ base: '0', sm: 'md' }}
        w="full"
      >
        <Link href={getPoolPath(pool)} prefetch={true}>
          <Grid {...rest} py={{ base: 'ms', md: 'md' }} pr="4">
            <GridItem>
              <NetworkIcon chain={pool.chain} size={6} />
            </GridItem>
            <GridItem>
              <PoolListTokenPills
                pool={pool}
                h={['32px', '36px']}
                p={['xxs', 'sm']}
                pr={[1.5, 'ms']}
                iconSize={20}
              />
            </GridItem>
            <GridItem>
              <Text textAlign="left" fontWeight="medium" textTransform="capitalize">
                {getPoolTypeLabel(pool.type)}
              </Text>
            </GridItem>
            {userAddress && (
              <GridItem>
                <Text textAlign="right" fontWeight="medium">
                  {toCurrency(getUserTotalBalanceUsd(pool), { abbreviated: false })}
                </Text>
              </GridItem>
            )}
            <GridItem>
              <Text
                title={toCurrency(pool.dynamicData.totalLiquidity, { abbreviated: false })}
                textAlign="right"
                fontWeight="medium"
              >
                {toCurrency(pool.dynamicData.totalLiquidity)}
              </Text>
            </GridItem>
            <GridItem textAlign="right">
              <Text
                title={toCurrency(pool.dynamicData.volume24h, { abbreviated: false })}
                textAlign="right"
                fontWeight="medium"
              >
                {toCurrency(pool.dynamicData.volume24h)}
              </Text>
            </GridItem>
            <GridItem justifySelf="end" pr={{ base: 'md', xl: '0' }}>
              <MemoizedMainAprTooltip
                aprItems={pool.dynamicData.aprItems}
                poolId={pool.id}
                textProps={{ fontWeight: 'medium', textAlign: 'right' }}
                pool={pool}
                height="auto"
              />
            </GridItem>
          </Grid>
        </Link>
      </Box>
    </FadeInOnView>
  )
}
