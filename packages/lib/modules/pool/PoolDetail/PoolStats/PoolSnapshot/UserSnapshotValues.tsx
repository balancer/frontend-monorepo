'use client'

import { memo, useMemo } from 'react'
import { Button, HStack, Heading, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react'
import { TokenIconStack } from '../../../../tokens/TokenIconStack'
import { TokenStackPopover } from '../../../../tokens/TokenStackPopover'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { isEmpty } from 'lodash'
import { useVebalBoost } from '../../../../vebal/useVebalBoost'
import { useClaim } from '../../../actions/claim/ClaimProvider'
import { getTotalAprRaw } from '../../../pool.utils'
import { usePool } from '../../../PoolProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { ClaimModal } from '../../../actions/claim/ClaimModal'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { useGetUserPoolRewards } from '../../../useGetUserPoolRewards'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { LabelWithTooltip } from '@repo/lib/shared/components/tooltips/LabelWithTooltip'

export type PoolMyStatsValues = {
  myLiquidity: number
  myPotentialWeeklyYield: string
  myClaimableRewards: number
}

const POSSIBLE_STAKED_BALANCE_USD = 10000

export function UserSnapshotValues() {
  const { chain, isLoading: isLoadingPool, myLiquiditySectionRef, pool } = usePool()
  const { toCurrency } = useCurrency()
  const { veBalBoostMap } = useVebalBoost([pool])

  const {
    disabledReason,
    hasNoRewards,
    isDisabled,
    previewModalDisclosure,
    isLoading: isLoadingClaiming,
    balRewards,
    nonBalRewards,
  } = useClaim()

  const { myClaimableRewards, tokens, rewardsByToken } = useGetUserPoolRewards({
    pool,
    balRewards,
    nonBalRewards,
  })

  const MemoizedMainAprTooltip = memo(MainAprTooltip)

  const boost = useMemo(() => {
    if (isEmpty(veBalBoostMap)) return
    return veBalBoostMap[pool.id]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veBalBoostMap])

  const myAprRaw = getTotalAprRaw(pool.dynamicData.aprItems, boost)

  const poolMyStatsValues: PoolMyStatsValues | undefined = useMemo(() => {
    if (pool && pool.userBalance && !isLoadingPool && !isLoadingClaiming) {
      const totalBalanceUsd = pool.userBalance.totalBalanceUsd

      return {
        myLiquidity: totalBalanceUsd,
        myPotentialWeeklyYield: bn(totalBalanceUsd || POSSIBLE_STAKED_BALANCE_USD)
          .times(bn(myAprRaw).div(52))
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
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
            My liquidity
          </Text>
          {poolMyStatsValues ? (
            poolMyStatsValues.myLiquidity ? (
              <HStack onClick={handleClick}>
                <Heading cursor="pointer" size="h4">
                  {toCurrency(poolMyStatsValues.myLiquidity)}
                </Heading>
                <Text
                  _groupHover={{ opacity: '1' }}
                  color="font.link"
                  cursor="pointer"
                  fontSize="sm"
                  opacity="0"
                  transition="opacity 0.2s var(--ease-out-cubic)"
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
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
            My APR
          </Text>
          {poolMyStatsValues && poolMyStatsValues.myLiquidity ? (
            <MemoizedMainAprTooltip
              aprItems={pool.dynamicData.aprItems}
              chain={pool.chain}
              height="28px"
              pool={pool}
              poolId={pool.id}
              textProps={{ fontWeight: 'bold', fontSize: '2xl', lineHeight: '28px' }}
              vebalBoost={boost || '1'}
            />
          ) : (
            <Heading size="h4">&mdash;</Heading>
          )}
        </VStack>
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          {poolMyStatsValues && !poolMyStatsValues.myLiquidity ? (
            <LabelWithTooltip
              label="My potential weekly yield on $10k"
              tooltip="The amount you could earn each week if you added $10,000 to this pool at its current APR. If there is an APR range, the amount displayed is based on the minimum APR."
            />
          ) : (
            <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
              My potential weekly yield
            </Text>
          )}

          {poolMyStatsValues ? (
            <Heading size="h4">{toCurrency(poolMyStatsValues.myPotentialWeeklyYield)}</Heading>
          ) : (
            <Skeleton height="28px" w="100px" />
          )}
        </VStack>
      </FadeInOnView>
      <FadeInOnView scaleUp={false}>
        <VStack align="flex-start" spacing="xxs" w="full">
          <Text fontSize="sm" fontWeight="semibold" mt="xxs" variant="secondary">
            My claimable rewards
          </Text>
          {poolMyStatsValues ? (
            hasNoRewards ? (
              <Heading size="h4">&mdash;</Heading>
            ) : (
              <HStack gap="xs">
                <Heading size="h4">{toCurrency(poolMyStatsValues.myClaimableRewards)}</Heading>
                <TokenStackPopover
                  chain={chain}
                  headerText="My claimable rewards"
                  rewardsByToken={rewardsByToken}
                  tokens={tokens}
                >
                  <TokenIconStack chain={chain} disablePopover size={20} tokens={tokens} />
                </TokenStackPopover>
                <Tooltip label={isDisabled ? disabledReason : ''}>
                  <Button
                    fontSize="sm"
                    isDisabled={isDisabled}
                    onClick={() => !isDisabled && previewModalDisclosure.onOpen()}
                    rounded="sm"
                    size="xxs"
                    variant="primary"
                    w="full"
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
      </FadeInOnView>
      <ClaimModal
        chain={pool.chain}
        isOpen={previewModalDisclosure.isOpen}
        onClose={onModalClose}
      />
    </>
  )
}
