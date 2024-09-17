'use client'

import React, { memo, useMemo } from 'react'
import { Button, HStack, Heading, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react'
import { TokenIconStack } from '../../../../tokens/TokenIconStack'
import { GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { SECONDS_IN_DAY } from '@/test/utils/numbers'
import { sumBy, isEmpty } from 'lodash'
import { useTokens } from '../../../../tokens/TokensProvider'
import { useVebalBoost } from '../../../../vebal/useVebalBoost'
import { useClaim } from '../../../actions/claim/ClaimProvider'
import { getTotalAprRaw } from '../../../pool.utils'
import { usePool } from '../../../PoolProvider'
import { bn } from '@/lib/shared/utils/numbers'
import { ClaimModal } from '../../../actions/claim/ClaimModal'
import MainAprTooltip from '@/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { calcTotalStakedBalanceUsd } from '../../../user-balance.helpers'

export type PoolMyStatsValues = {
  myLiquidity: number
  myPotentialWeeklyYield: string
  myClaimableRewards: number
}

const POSSIBLE_STAKED_BALANCE_USD = 10000

export function UserSnapshotValues() {
  const { pool, chain, isLoading: isLoadingPool, myLiquiditySectionRef } = usePool()
  const { toCurrency } = useCurrency()
  const { veBalBoostMap } = useVebalBoost([pool])
  const { getToken } = useTokens()

  const {
    isLoading: isLoadingClaiming,
    hasNoRewards,
    balRewards,
    nonBalRewards,
    previewModalDisclosure,
    disabledReason,
    isDisabled,
  } = useClaim()

  const MemoizedMainAprTooltip = memo(MainAprTooltip)

  // TODO: only uses Balancer rewards rn
  const claimableRewards = [...balRewards, ...nonBalRewards]
  const myClaimableRewards = sumBy(claimableRewards, reward => reward.fiatBalance.toNumber())

  const currentRewards = pool.staking?.gauge?.rewards || []
  const currentRewardsPerWeek = currentRewards.map(reward => {
    return {
      ...reward,
      rewardPerWeek: parseFloat(reward.rewardPerSecond) * SECONDS_IN_DAY * 7,
    }
  })

  const tokens = currentRewardsPerWeek
    .filter(reward => bn(reward.rewardPerSecond).gt(0))
    .map(reward => getToken(reward.tokenAddress, chain)) as GqlToken[]

  const boost = useMemo(() => {
    if (isEmpty(veBalBoostMap)) return
    return veBalBoostMap[pool.id]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veBalBoostMap])

  const myAprRaw = getTotalAprRaw(pool.dynamicData.aprItems, boost)

  const poolMyStatsValues: PoolMyStatsValues | undefined = useMemo(() => {
    if (pool && pool.userBalance && !isLoadingPool && !isLoadingClaiming) {
      const totalBalanceUsd = pool.userBalance.totalBalanceUsd

      // TODO: only uses Balancer balances rn
      const stakedBalanceUsd = totalBalanceUsd
        ? calcTotalStakedBalanceUsd(pool)
        : POSSIBLE_STAKED_BALANCE_USD

      return {
        // TODO: only uses Balancer balances rn
        myLiquidity: totalBalanceUsd,
        // TODO: only uses Balancer balances rn
        myPotentialWeeklyYield: bn(stakedBalanceUsd)
          .times(bn(bn(myAprRaw).div(100)).div(52))
          .toFixed(2),
        myClaimableRewards: myClaimableRewards,
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veBalBoostMap, pool])

  function onModalClose() {
    previewModalDisclosure.onClose()
  }

  function handleClick() {
    myLiquiditySectionRef?.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          My liquidity
        </Text>
        {poolMyStatsValues ? (
          poolMyStatsValues.myLiquidity ? (
            <HStack onClick={handleClick}>
              <Heading cursor="pointer" size="h4">
                {toCurrency(poolMyStatsValues.myLiquidity)}
              </Heading>
              <Text
                color="font.link"
                cursor="pointer"
                opacity="0"
                fontSize="sm"
                transition="opacity 0.2s var(--ease-out-cubic)"
                _groupHover={{ opacity: '1' }}
              >
                Manage
              </Text>
            </HStack>
          ) : (
            <Heading size="h4">&mdash;</Heading>
          )
        ) : (
          <Skeleton height="28px" w="100px" />
        )}
      </VStack>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          My APR
        </Text>
        {poolMyStatsValues && poolMyStatsValues.myLiquidity ? (
          <MemoizedMainAprTooltip
            aprItems={pool.dynamicData.aprItems}
            poolId={pool.id}
            textProps={{ fontWeight: 'bold', fontSize: '2xl', lineHeight: '28px' }}
            vebalBoost={boost || '1'}
            pool={pool}
          />
        ) : (
          <Heading size="h4">&mdash;</Heading>
        )}
      </VStack>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          {`My potential weekly yield${
            poolMyStatsValues && !poolMyStatsValues.myLiquidity ? ' on $10k' : ''
          }`}
        </Text>
        {poolMyStatsValues ? (
          <Heading size="h4">{toCurrency(poolMyStatsValues.myPotentialWeeklyYield)}</Heading>
        ) : (
          <Skeleton height="28px" w="100px" />
        )}
      </VStack>
      <VStack spacing="0" align="flex-start" w="full">
        <Text variant="secondary" fontWeight="semibold" fontSize="sm" mt="xxs">
          My claimable rewards
        </Text>
        {poolMyStatsValues ? (
          hasNoRewards ? (
            <Heading size="h4">&mdash;</Heading>
          ) : (
            <HStack>
              <Heading size="h4">{toCurrency(poolMyStatsValues.myClaimableRewards)}</Heading>
              <TokenIconStack tokens={tokens} chain={chain} size={20} />
              <Tooltip label={isDisabled ? disabledReason : ''}>
                <Button
                  variant="primary"
                  w="full"
                  size="xxs"
                  isDisabled={isDisabled}
                  onClick={() => !isDisabled && previewModalDisclosure.onOpen()}
                >
                  Claim
                </Button>
              </Tooltip>
            </HStack>
          )
        ) : (
          <Skeleton height="28px" w="100px" />
        )}
      </VStack>
      <ClaimModal
        isOpen={previewModalDisclosure.isOpen}
        onClose={onModalClose}
        chain={pool.chain}
      />
    </>
  )
}
