import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { useBreakpoints } from '../../shared/hooks/useBreakpoints'
import { Card, VStack } from '@chakra-ui/react'
import { MobileStepTracker } from '../../modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { usePool } from '../../../PoolProvider'
import { PoolActionsPriceImpactDetails } from '../../PoolActionsPriceImpactDetails'
import { parseUnits } from 'viem'
import { BptRow } from '../../modules/tokens/TokenRow/BptRow'
import { TokenRowGroup } from '../../modules/tokens/TokenRow/TokenRowGroup'
import { bn } from '../../shared/utils/numbers'
import { AnimateHeightChange } from '../../shared/components/modals/AnimatedModalBody'
import { useUserAccount } from '../../modules/web3/UserAccountProvider'
import { RemoveLiquidityReceiptResult } from '../../modules/transactions/transaction-steps/receipts/receipt.hooks'
import { BalAlert } from '../../shared/components/alerts/BalAlert'
import { useTokens } from '../../modules/tokens/TokensProvider'
import { CardPopAnim } from '../../shared/components/animations/CardPopAnim'

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
  const { getTokensByChain } = useTokens()
  const { pool } = usePool()
  const { userAddress, isLoading: isUserAddressLoading } = useUserAccount()

  const _amountsOut = amountsOut.filter(amount => bn(amount.humanAmount).gt(0))

  const shouldShowErrors = hasQuoteContext ? removeLiquidityTxSuccess : removeLiquidityTxHash
  const shouldShowReceipt = removeLiquidityTxHash && !isLoadingReceipt && receivedTokens.length > 0

  if (!isUserAddressLoading && !userAddress) {
    return <BalAlert status="warning" content="User is not connected" />
  }
  if (shouldShowErrors && error) {
    return <BalAlert status="warning" content="We were unable to find this transaction hash" />
  }
  if (shouldShowErrors && !isLoadingReceipt && !receivedTokens.length) {
    return (
      <BalAlert
        status="warning"
        content="We were unable to find logs for this transaction hash and the connected account"
      />
    )
  }

  return (
    <AnimateHeightChange spacing="sm">
      {isMobile && hasQuoteContext && (
        <MobileStepTracker transactionSteps={transactionSteps} chain={pool.chain} />
      )}

      <Card variant="modalSubSection">
        <BptRow
          label={shouldShowReceipt ? 'You removed' : "You're removing"}
          bptAmount={shouldShowReceipt ? sentBptUnits : quoteBptIn}
          isLoading={shouldShowReceipt ? isLoadingReceipt : false}
          pool={pool}
        />
      </Card>

      <Card variant="modalSubSection">
        <TokenRowGroup
          label={shouldShowReceipt ? 'You received' : "You're expected to get (if no slippage)"}
          amounts={shouldShowReceipt ? receivedTokens : _amountsOut}
          chain={pool.chain}
          totalUSDValue={shouldShowReceipt ? undefined : totalUSDValue}
          isLoading={shouldShowReceipt ? isLoadingReceipt : false}
          tokens={shouldShowReceipt ? getTokensByChain(pool.chain) : undefined}
        />
      </Card>

      {!shouldShowReceipt && hasQuoteContext && (
        <CardPopAnim key="price-impact-details">
          <Card variant="modalSubSection">
            <VStack align="start" spacing="sm">
              <PoolActionsPriceImpactDetails
                totalUSDValue={totalUSDValue}
                bptAmount={BigInt(parseUnits(quoteBptIn, 18))}
              />
            </VStack>
          </Card>
        </CardPopAnim>
      )}
    </AnimateHeightChange>
  )
}
