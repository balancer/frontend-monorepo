import { Box, Grid, GridItem, GridProps, HStack, Text, Image } from '@chakra-ui/react'
import { PoolListTableDetailsCell } from '@repo/lib/modules/pool/PoolList/PoolListTable/PoolListTableDetailsCell'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import Link from 'next/link'
import { memo } from 'react'
import { usePoolMetadata } from '../../metadata/usePoolMetadata'
import { PoolListItem } from '../../pool.types'
import { getPoolPath } from '../../pool.utils'
import { getUserTotalBalanceUsd } from '../../user-balance.helpers'
import { usePoolList } from '../PoolListProvider'
import { PoolListPoolDisplay } from '../PoolListPoolDisplay'
import { isLiquidityBootstrapping, isV3Pool } from '../../pool.helpers'
import { isDev, isStaging } from '@repo/lib/config/app.config'
import { isAfter, secondsToMilliseconds } from 'date-fns'
import { now } from '@repo/lib/shared/utils/time'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'

interface Props extends GridProps {
  pool: PoolListItem
  keyValue: number
  needsMarginForPoints?: boolean
}

const MemoizedMainAprTooltip = memo(MainAprTooltip)

export function PoolListTableRow({ pool, keyValue, needsMarginForPoints, ...rest }: Props) {
  const {
    queryState: { userAddress },
    poolDisplayType,
  } = usePoolList()
  const { name } = usePoolMetadata(pool)
  const { toCurrency } = useCurrency()

  const hasPoints = pool.tags?.some(tag => tag === 'POINTS')

  const isV3LBP = isV3Pool(pool) && isLiquidityBootstrapping(pool.type)

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
        <Link href={getPoolPath(pool)} prefetch role="group">
          <Grid {...rest} pr="4" py={{ base: 'ms', md: 'md' }}>
            <GridItem>
              <NetworkIcon chain={pool.chain} size={6} />
            </GridItem>
            <GridItem>
              <PoolListPoolDisplay name={name} pool={pool} poolDisplayType={poolDisplayType} />
            </GridItem>
            <GridItem minW="32">
              <PoolListTableDetailsCell pool={pool} />
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
              <TooltipWithTouch
                bg="background.base"
                color="font.secondary"
                label={lbpTooltipText(pool)}
                placement="top"
              >
                <Text
                  fontWeight="medium"
                  textAlign="right"
                  textDecoration={
                    isV3LBP && !lbpSaleIsOngoing(pool) && (isDev || isStaging)
                      ? 'line-through'
                      : 'none'
                  }
                  title={toCurrency(pool.dynamicData.volume24h, { abbreviated: false })}
                >
                  {toCurrency(pool.dynamicData.volume24h)}
                </Text>
              </TooltipWithTouch>
            </GridItem>
            <GridItem justifySelf="end" pr={{ base: 'md', xl: '0' }}>
              <HStack gap="xxs" mr={needsMarginForPoints && !hasPoints ? '12px' : '0'}>
                <MemoizedMainAprTooltip
                  aprItems={pool.dynamicData.aprItems}
                  chain={pool.chain}
                  height="auto"
                  pool={pool}
                  poolId={pool.id}
                  textProps={{ fontWeight: 'medium', textAlign: 'right' }}
                />
                {hasPoints && (
                  <Image
                    alt="points"
                    h="15px"
                    ml="0.5"
                    src="/images/icons/pool-points.svg"
                    w="10px"
                  />
                )}
              </HStack>
            </GridItem>
          </Grid>
        </Link>
      </Box>
    </FadeInOnView>
  )
}

function lbpSaleIsOngoing(pool: PoolListItem) {
  const startTime = secondsToMilliseconds(pool.lbpParams?.startTime || 0)
  const endTime = secondsToMilliseconds(pool.lbpParams?.endTime || 0)
  const hasStarted = Boolean(startTime && isAfter(now(), startTime))
  const hasEnded = Boolean(endTime && isAfter(now(), endTime))

  return hasStarted && !hasEnded
}

function lbpTooltipText(pool: PoolListItem) {
  const isV3LBP = isV3Pool(pool) && isLiquidityBootstrapping(pool.type)
  if (!isV3LBP || (!isDev && !isStaging)) return ''

  const startTime = secondsToMilliseconds(pool.lbpParams?.startTime || 0)
  const hasStarted = Boolean(startTime && isAfter(now(), startTime))
  if (!hasStarted) {
    return `Since the LBP has not started, this pool won't route swaps
    or allow interaction outside of the pool creator.`
  }

  const endTime = secondsToMilliseconds(pool.lbpParams?.endTime || 0)
  const hasEnded = Boolean(endTime && isAfter(now(), endTime))
  if (hasEnded) {
    return `Since the LBP has ended, this pool won't route swaps
    or allow interaction outside of the pool creator.`
  }

  return ''
}
