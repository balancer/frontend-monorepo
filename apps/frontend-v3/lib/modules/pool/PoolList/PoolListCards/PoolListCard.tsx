import { Card, HStack, VStack, Text, Grid, GridItem } from '@chakra-ui/react'
import { PoolListItem } from '../../pool.types'
import MainAprTooltip from '@/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { ReactNode, isValidElement, memo } from 'react'
import { NetworkIcon } from '@/lib/shared/components/icons/NetworkIcon'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { usePoolListQueryState } from '../usePoolListQueryState'
import { TokenIconStack } from '@/lib/modules/tokens/TokenIconStack'
import {
  getPoolTypeLabel,
  getTotalAprLabel,
  poolClickHandler,
  poolMouseEnterHandler,
} from '../../pool.utils'
import { useRouter } from 'next/navigation'
import { PoolName } from '../../PoolName'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'
import { getUserTotalBalanceUsd } from '../../user-balance.helpers'

interface Props {
  pool: PoolListItem
}

function StatCard({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <Card h="full" variant="gradient" p="sm">
      <VStack alignItems="flex-start" w="full" gap="0">
        {isValidElement(label) ? (
          label
        ) : (
          <Text fontWeight="medium" variant="secondary" fontSize="sm">
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
        variant="gradient"
        cursor="pointer"
        onClick={event => poolClickHandler(event, pool, router)}
        onMouseEnter={event => poolMouseEnterHandler(event, pool, router)}
        p="md"
      >
        <VStack alignItems="flex-start" h="full">
          <HStack alignItems="flex-start">
            <NetworkIcon chain={pool.chain} />
            <VStack alignItems="flex-start" gap="0" w="full">
              <Text fontWeight="medium" variant="secondary" fontSize="sm">
                {getPoolTypeLabel(pool.type)}
              </Text>
              <PoolName pool={pool} fontWeight="bold" noOfLines={2} h="12" />
            </VStack>
          </HStack>
          <TokenIconStack tokens={pool.displayTokens} chain={pool.chain} pb="lg" />
          <Grid w="full" h="full" templateColumns="1fr 1fr" templateRows="1fr 1fr" gap="sm">
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
                    <Text fontWeight="medium" variant="secondary" fontSize="sm">
                      APR
                    </Text>
                    <MemoizedMainAprTooltip
                      aprItems={pool.dynamicData.aprItems}
                      poolId={pool.id}
                      textProps={{ fontSize: '1rem', fontWeight: 'bold' }}
                      onlySparkles
                      pool={pool}
                    />
                  </HStack>
                }
                value={
                  <Text fontWeight="bold" fontSize="sm">
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
