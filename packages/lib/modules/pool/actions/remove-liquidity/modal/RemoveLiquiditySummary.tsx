import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { Card, VStack } from '@chakra-ui/react'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { usePool } from '../../../PoolProvider'
import { PoolActionsPriceImpactDetails } from '../../PoolActionsPriceImpactDetails'
import { parseUnits } from 'viem'
import { BptRow } from '@repo/lib/modules/tokens/TokenRow/BptRow'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'
import { bn } from '@repo/lib/shared/utils/numbers'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { RemoveLiquidityReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { CardPopAnim } from '@repo/lib/shared/components/animations/CardPopAnim'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { allPoolTokens } from '@repo/lib/modules/pool/pool-tokens.utils'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { isWrappedNativeAsset } from '@repo/lib/modules/tokens/token.helpers'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'

export function RemoveLiquiditySummary({
  isLoading: isLoadingReceipt,
  receivedTokens,
  sentBptUnits,
  error,
}: RemoveLiquidityReceiptResult) {
  const {
    transactionSteps,
    quoteBptIn,
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

  const _amountsOut = amountsOut.filter(amount => bn(amount.humanAmount).gt(0))

  const shouldShowErrors = hasQuoteContext ? removeLiquidityTxSuccess : removeLiquidityTxHash
  const shouldShowReceipt = removeLiquidityTxHash && !isLoadingReceipt && receivedTokens.length > 0

  const tokens = allPoolTokens(pool)
    .map(token => {
      // also add native asset if wrapped native asset is in the pool
      if (isWrappedNativeAsset(token.address, pool.chain)) {
        const nativeAsset = getNetworkConfig(pool.chain).tokens.nativeAsset

        return [
          { ...token, chain: pool.chain },
          { ...nativeAsset, chain: pool.chain },
        ] as ApiToken[]
      }
      return { ...token, chain: pool.chain } as ApiToken
    })
    .flat()

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
        <MobileStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
      )}

      <Card variant="modalSubSection">
        <BptRow
          bptAmount={shouldShowReceipt ? sentBptUnits : quoteBptIn}
          isLoading={shouldShowReceipt ? isLoadingReceipt : false}
          label={shouldShowReceipt ? 'You removed' : "You're removing"}
          pool={pool}
        />
      </Card>

      <Card variant="modalSubSection">
        <TokenRowGroup
          amounts={shouldShowReceipt ? receivedTokens : _amountsOut}
          chain={pool.chain}
          isLoading={shouldShowReceipt ? isLoadingReceipt : false}
          label={shouldShowReceipt ? 'You received' : "You're expected to get (if no slippage)"}
          pool={pool}
          tokens={shouldShowReceipt ? tokens : undefined}
          totalUSDValue={shouldShowReceipt ? undefined : totalUSDValue}
        />
      </Card>

      {shouldShowReceipt && (
        <GasCostSummaryCard chain={pool.chain} transactionSteps={transactionSteps.steps} />
      )}
      {!shouldShowReceipt && hasQuoteContext && (
        <CardPopAnim key="price-impact-details">
          <Card variant="modalSubSection">
            <VStack align="start" spacing="sm">
              <PoolActionsPriceImpactDetails
                bptAmount={BigInt(parseUnits(quoteBptIn, 18))}
                slippage={slippage}
                totalUSDValue={totalUSDValue}
              />
            </VStack>
          </Card>
        </CardPopAnim>
      )}
    </AnimateHeightChange>
  )
}
