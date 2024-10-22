import { Card, HStack, VStack, Text, Grid, GridItem } from '@chakra-ui/react'
import { PoolListItem } from '../../pool.types'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { ReactNode, isValidElement, memo } from 'react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { usePoolListQueryState } from '../usePoolListQueryState'
import { TokenIconStack } from '@repo/lib/modules/tokens/TokenIconStack'
import {
  getPoolTypeLabel,
  getTotalAprLabel,
  poolClickHandler,
  poolMouseEnterHandler,
} from '../../pool.utils'
import { useRouter } from 'next/navigation'
import { PoolName } from '../../PoolName'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { getUserTotalBalanceUsd } from '../../user-balance.helpers'

interface Props {
  pool: PoolListItem
}

function StatCard({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <Card h="full" p="sm" variant="gradient">
      <VStack alignItems="flex-start" gap="0" w="full">
        {isValidElement(label) ? (
          label
        ) : (
          <Text fontSize="sm" fontWeight="medium" variant="secondary">
            {label}
          </Text>
        )}
        {isValidElement(value) ? value : <Text fontWeight="bold">{value}</Text>}
      </VStack>
    </Card>
  )
}

const MemoizedMainAprTooltip = memo(MainAprTooltip)

export function PoolListCard({ pool }: Props) {
  const { toCurrency } = useCurrency()
  const { userAddress } = usePoolListQueryState()
  const router = useRouter()

  return (
    <FadeInOnView animateOnce={false}>
      <Card
        cursor="pointer"
        onClick={event => poolClickHandler(event, pool, router)}
        onMouseEnter={event => poolMouseEnterHandler(event, pool, router)}
        p="md"
        variant="gradient"
      >
        <VStack alignItems="flex-start" h="full">
          <HStack alignItems="flex-start">
            <NetworkIcon chain={pool.chain} />
            <VStack alignItems="flex-start" gap="0" w="full">
              <Text fontSize="sm" fontWeight="medium" variant="secondary">
                {getPoolTypeLabel(pool.type)}
              </Text>
              <PoolName fontWeight="bold" h="12" noOfLines={2} pool={pool} />
            </VStack>
          </HStack>
          <TokenIconStack chain={pool.chain} pb="lg" tokens={pool.displayTokens} />
          <Grid gap="sm" h="full" templateColumns="1fr 1fr" templateRows="1fr 1fr" w="full">
            <GridItem>
              <StatCard label="TVL" value={toCurrency(pool.dynamicData.totalLiquidity)} />
            </GridItem>
            <GridItem>
              <StatCard label="Volume (24h)" value={toCurrency(pool.dynamicData.volume24h)} />
            </GridItem>
            <GridItem>
              <StatCard
                label="My Liquidity"
                value={
                  userAddress
                    ? toCurrency(getUserTotalBalanceUsd(pool), { abbreviated: false })
                    : '-'
                }
              />
            </GridItem>
            <GridItem>
              <StatCard
                label={
                  <HStack>
                    <Text fontSize="sm" fontWeight="medium" variant="secondary">
                      APR
                    </Text>
                    <MemoizedMainAprTooltip
                      aprItems={pool.dynamicData.aprItems}
                      onlySparkles
                      pool={pool}
                      poolId={pool.id}
                      textProps={{ fontSize: '1rem', fontWeight: 'bold' }}
                    />
                  </HStack>
                }
                value={
                  <Text fontSize="sm" fontWeight="bold">
                    {getTotalAprLabel(pool.dynamicData.aprItems)}
                  </Text>
                }
              />
            </GridItem>
          </Grid>
        </VStack>
      </Card>
    </FadeInOnView>
  )
}
