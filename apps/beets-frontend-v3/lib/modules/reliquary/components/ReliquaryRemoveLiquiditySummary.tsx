import { Address, isSameAddress } from '@balancer/sdk'
import { Card, Text, VStack } from '@chakra-ui/react'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { PoolActionsPriceImpactDetails } from '@repo/lib/modules/pool/actions/PoolActionsPriceImpactDetails'
import { useRemoveLiquidity } from '@repo/lib/modules/pool/actions/remove-liquidity/RemoveLiquidityProvider'
import { allPoolTokens } from '@repo/lib/modules/pool/pool-tokens.utils'
import { BptRow } from '@repo/lib/modules/tokens/TokenRow/BptRow'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'
import { isWrappedNativeAsset } from '@repo/lib/modules/tokens/token.helpers'
import {
  ApiToken,
  HumanTokenAmount,
  HumanTokenAmountWithSymbol,
} from '@repo/lib/modules/tokens/token.types'
import { useTotalUsdValue } from '@repo/lib/modules/tokens/useTotalUsdValue'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'
import { RemoveLiquidityReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { CardPopAnim } from '@repo/lib/shared/components/animations/CardPopAnim'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useReliquary } from '../ReliquaryProvider'

type Props = RemoveLiquidityReceiptResult & {
  relicId?: string
}

export function ReliquaryRemoveLiquiditySummary({
  isLoading: isLoadingReceipt,
  receivedTokens,
  sentBptUnits,
  error,
  relicId,
}: Props) {
  const {
    transactionSteps,
    humanBptIn,
    totalUSDValue,
    amountsOut,
    hasQuoteContext,
    removeLiquidityTxHash,
    removeLiquidityTxSuccess,
  } = useRemoveLiquidity()
  const { isMobile } = useBreakpoints()
  const { pool } = usePool()
  const { userAddress, isLoading: isUserAddressLoading } = useUserAccount()
  const { slippage } = useUserSettings()
  const { chain, pendingRewardsByRelicId } = useReliquary()
  const pendingRewardsAmount = relicId ? (pendingRewardsByRelicId[relicId] ?? '0') : '0'
  const networkConfig = getNetworkConfig(chain)

  const _amountsOut = amountsOut.filter(amount => bn(amount.humanAmount).gt(0))

  const shouldShowErrors = hasQuoteContext ? removeLiquidityTxSuccess : removeLiquidityTxHash
  const shouldShowReceipt = removeLiquidityTxHash && !isLoadingReceipt && receivedTokens.length > 0

  // Create rewards amount object if rewards exist (only for preview, not receipt)
  const rewardsAmount: HumanTokenAmountWithSymbol | null =
    !shouldShowReceipt && bn(pendingRewardsAmount).gt(0)
      ? {
          tokenAddress: networkConfig.tokens.addresses.beets as `0x${string}`,
          humanAmount: pendingRewardsAmount as `${number}` | '',
          symbol: 'BEETS',
        }
      : null

  const tokens = allPoolTokens(pool).flatMap(token => {
    // also add native asset if wrapped native asset is in the pool
    if (isWrappedNativeAsset(token.address, chain)) {
      const nativeAsset = getNetworkConfig(chain).tokens.nativeAsset

      return [
        { ...token, chain },
        { ...nativeAsset, chain },
      ] as ApiToken[]
    }
    return { ...token, chain } as ApiToken
  })

  // Calculate USD value for rewards
  const { usdValueFor } = useTotalUsdValue(tokens)
  const rewardsUSDValue = rewardsAmount ? usdValueFor([rewardsAmount]) : '0'

  // Filter out BPT from received tokens (user doesn't receive BPT, it gets burned)
  const receivedTokensWithoutBpt = shouldShowReceipt
    ? receivedTokens.filter(
        token => !isSameAddress(token.tokenAddress, pool.address as `0x${string}`)
      )
    : []

  const _amountsOutWithRewards: HumanTokenAmount[] = _amountsOut.map(token => {
    if (isSameAddress(token.tokenAddress, networkConfig.tokens.addresses.beets as Address)) {
      return {
        ...token,
        humanAmount: `${Number(token.humanAmount) + Number(rewardsAmount?.humanAmount)}`,
      }
    }
    return token
  })

  if (!isUserAddressLoading && !userAddress) {
    return <BalAlert content="User is not connected" status="warning" />
  }
  if (shouldShowErrors && error) {
    return <BalAlert content="We were unable to find this transaction hash" status="warning" />
  }
  if (shouldShowErrors && !isLoadingReceipt && !receivedTokens.length) {
    return (
      <BalAlert
        content="We were unable to find logs for this transaction hash and the connected account"
        status="warning"
      />
    )
  }

  return (
    <AnimateHeightChange spacing="sm">
      {isMobile && hasQuoteContext && (
        <MobileStepTracker chain={chain} transactionSteps={transactionSteps} />
      )}
      {!shouldShowReceipt && relicId && (
        <BalAlert
          content={`Remove liquidity from Relic #{relicId} and claim rewards`}
          mb="sm"
          status="info"
        />
      )}
      <Card variant="modalSubSection">
        <BptRow
          bptAmount={shouldShowReceipt ? sentBptUnits : humanBptIn}
          isLoading={shouldShowReceipt ? isLoadingReceipt : false}
          label={
            shouldShowReceipt
              ? `Removed liquidity from Relic #${relicId || ''}`
              : `Removing liquidity from Relic #${relicId || ''}`
          }
          pool={pool}
        />
      </Card>
      {rewardsAmount && (
        <Card variant="modalSubSection">
          <TokenRowGroup
            amounts={[rewardsAmount]}
            chain={chain}
            label="Pending rewards"
            pool={pool}
            tokens={tokens}
            totalUSDValue={rewardsUSDValue}
          />
        </Card>
      )}
      <Card variant="modalSubSection">
        <TokenRowGroup
          amounts={shouldShowReceipt ? receivedTokensWithoutBpt : _amountsOutWithRewards}
          chain={chain}
          isLoading={shouldShowReceipt ? isLoadingReceipt : false}
          label={
            shouldShowReceipt
              ? 'You received'
              : rewardsAmount
                ? 'Total expected (with rewards)'
                : "You're expected to get (if no slippage)"
          }
          pool={pool}
          tokens={shouldShowReceipt ? tokens : undefined}
          totalUSDValue={
            hasQuoteContext ? bn(totalUSDValue).plus(rewardsUSDValue).toString() : undefined
          }
        />
      </Card>
      {shouldShowReceipt ? (
        <>
          <GasCostSummaryCard chain={chain} transactionSteps={transactionSteps.steps} />
          <CardPopAnim key="success-message">
            <Card variant="modalSubSection">
              <VStack align="start" spacing="md" w="full">
                <Text color="font.highlight">
                  Successfully removed liquidity from Relic #{relicId}! Rewards have been harvested.
                </Text>
                <Text color="font.secondary" fontSize="sm">
                  Your tokens are now in your wallet. Return to the maBEETS page to view your
                  remaining Relics.
                </Text>
              </VStack>
            </Card>
          </CardPopAnim>
        </>
      ) : (
        hasQuoteContext && (
          <CardPopAnim key="price-impact-details">
            <Card variant="modalSubSection">
              <VStack align="start" spacing="sm">
                <PoolActionsPriceImpactDetails
                  bptAmount={undefined}
                  isSummary
                  slippage={slippage}
                  totalUSDValue={totalUSDValue}
                />
              </VStack>
            </Card>
          </CardPopAnim>
        )
      )}
    </AnimateHeightChange>
  )
}
