import { Box, Grid, GridItem, GridProps, HStack, Text } from '@chakra-ui/react'
import Link from 'next/link'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { memo } from 'react'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { getPoolPath } from '../../pool/pool.utils'
import { ProtocolIcon } from '@repo/lib/shared/components/icons/ProtocolIcon'
import { Protocol } from '../../protocols/useProtocols'
import { ExpandedPoolInfo, ExpandedPoolType } from './useExpandedPools'
import { getCanStake } from '../../pool/actions/stake.helpers'
import AuraAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/AuraAprTooltip'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { PollListTableDetailsCell } from '@repo/lib/modules/pool/PoolList/PoolListTable/PollListTableDetailsCell'
import { usePoolMetadata } from '../../pool/metadata/usePoolMetadata'
import { PoolListPoolDisplay } from '../../pool/PoolList/PoolListPoolDisplay'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

interface Props extends GridProps {
  pool: ExpandedPoolInfo
  keyValue: number
  veBalBoostMap: Record<string, string>
}

const MemoizedMainAprTooltip = memo(MainAprTooltip)

function getStakingText(poolType: ExpandedPoolType) {
  switch (poolType) {
    case ExpandedPoolType.StakedBal:
    case ExpandedPoolType.StakedAura:
      return 'Staked'
    case ExpandedPoolType.Unstaked:
      return 'Unstaked'
    case ExpandedPoolType.Locked:
      return 'Locked'
    case ExpandedPoolType.Unlocked:
      return 'Unlocked'
    default:
      return 'N/A'
  }
}

export function PortfolioTableRow({ pool, keyValue, veBalBoostMap, ...rest }: Props) {
  const { toCurrency } = useCurrency()
  const { name } = usePoolMetadata(pool)
  const { options } = PROJECT_CONFIG

  const vebalBoostValue = veBalBoostMap?.[pool.id]
  const canStake = getCanStake(pool)
  const stakingText = canStake ? getStakingText(pool.poolType) : 'N/A'

  return (
    <FadeInOnView>
      <Box
        _hover={{
          bg: 'background.base',
        }}
        key={keyValue}
        px={{ base: 'ms', sm: '0' }}
        rounded="md"
        transition="all 0.2s ease-in-out"
        w="full"
      >
        <Link href={getPoolPath(pool)} prefetch>
          <Grid {...rest} py={{ base: 'ms', md: 'md' }}>
            <GridItem>
              <NetworkIcon chain={pool.chain} size={6} />
            </GridItem>
            <GridItem>
              <PoolListPoolDisplay name={name} pool={pool} />
            </GridItem>
            <GridItem>
              <PollListTableDetailsCell pool={pool} />
            </GridItem>
            <GridItem display="flex" justifyContent="left" px="sm">
              <HStack>
                <Text fontWeight="medium">{stakingText} </Text>
                <StakingIcons pool={pool} showIcon={options.showVeBal} />
              </HStack>
            </GridItem>
            {options?.showVeBal && (
              <GridItem px="sm">
                <Text
                  fontWeight="medium"
                  textAlign="right"
                  title={toCurrency(pool.dynamicData.volume24h, { abbreviated: false })}
                >
                  {vebalBoostValue ? `${Number(vebalBoostValue).toFixed(2)}x` : '-'}
                </Text>
              </GridItem>
            )}
            <GridItem px="sm">
              <Text fontWeight="medium" textAlign="right">
                {toCurrency(pool.poolPositionUsd, { abbreviated: false })}
              </Text>
            </GridItem>
            <GridItem justifySelf="end" px="sm">
              {pool.poolType === ExpandedPoolType.StakedAura ? (
                pool.staking?.aura?.apr ? (
                  <AuraAprTooltip auraApr={pool.staking?.aura?.apr} />
                ) : (
                  ' - '
                )
              ) : (
                <MemoizedMainAprTooltip
                  aprItems={pool.dynamicData.aprItems}
                  chain={pool.chain}
                  pool={pool}
                  poolId={pool.id}
                  textProps={{ fontWeight: 'medium' }}
                  vebalBoost={vebalBoostValue}
                />
              )}
            </GridItem>
          </Grid>
        </Link>
      </Box>
    </FadeInOnView>
  )
}

function StakingIcons({ pool, showIcon }: { pool: ExpandedPoolInfo; showIcon: boolean }) {
  const canStake = getCanStake(pool)

  const shouldHideIcon = pool.poolType === ExpandedPoolType.Unstaked || !canStake

  if (shouldHideIcon || !showIcon) {
    return null
  }

  const showAuraIcon = pool.poolType === ExpandedPoolType.StakedAura

  const showBalIcon =
    pool.poolType === ExpandedPoolType.StakedBal || pool.poolType === ExpandedPoolType.Locked

  return (
    <>
      {showAuraIcon && <ProtocolIcon protocol={Protocol.Aura} />}
      {showBalIcon && <ProtocolIcon protocol={Protocol.Balancer} />}
    </>
  )
}
