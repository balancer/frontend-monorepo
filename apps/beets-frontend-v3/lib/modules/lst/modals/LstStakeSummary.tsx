import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useLst } from '../LstProvider'
import { LstStakeReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { HumanAmount } from '@balancer/sdk'
import { SwapTokenRow } from '@repo/lib/modules/tokens/TokenRow/SwapTokenRow'

export function LstStakeSummary({
  isLoading: isLoadingReceipt,
  receivedTokens,
  sentNativeAssetAmount,
  error,
}: LstStakeReceiptResult) {
  const { isMobile } = useBreakpoints()
  const { chain, stakeTransactionSteps, lstStakeTxHash, nativeAsset, stakedAsset, amount } =
    useLst()

  //const expectedTokenOut = simulationQuery?.data?.returnAmount as HumanAmount

  const shouldShowReceipt =
    !!lstStakeTxHash && !isLoadingReceipt && !!receivedTokens && !!sentNativeAssetAmount

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={stakeTransactionSteps} />}
      <Card variant="modalSubSection">
        <SwapTokenRow
          chain={chain}
          label={shouldShowReceipt ? 'You staked' : 'You stake'}
          tokenAddress={nativeAsset}
          tokenAmount={amount}
        />
      </Card>
      <Card variant="modalSubSection">
        <SwapTokenRow
          chain={chain}
          label={shouldShowReceipt ? 'You received' : 'You receive'}
          tokenAddress={stakedAsset}
          tokenAmount="0" // TODO: add estimated amount here
        />
      </Card>
    </AnimateHeightChange>
  )
}
