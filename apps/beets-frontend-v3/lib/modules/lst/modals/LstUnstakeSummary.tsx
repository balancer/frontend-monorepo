import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useLst } from '../LstProvider'
import { LstStakeReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { SwapTokenRow } from '@repo/lib/modules/tokens/TokenRow/SwapTokenRow'
// import { useGetUnstakedAmount } from '../hooks/useGetUnstakedAmount'
// import { formatUnits, parseUnits } from 'viem'

export function LstUnstakeSummary({
  isLoading: isLoadingReceipt,
  receivedTokens,
  sentNativeAssetAmount,
}: LstStakeReceiptResult) {
  const { isMobile } = useBreakpoints()

  const { chain, stakeTransactionSteps, lstStakeTxHash, nativeAsset, stakedAsset, amount } =
    useLst()

  //const { unstakedAmount } = useGetUnstakedAmount(parseUnits(amount, 18))

  const shouldShowReceipt =
    !!lstStakeTxHash && !isLoadingReceipt && !!receivedTokens && !!sentNativeAssetAmount

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={stakeTransactionSteps} />}
      <Card variant="modalSubSection">
        <SwapTokenRow
          chain={chain}
          label={shouldShowReceipt ? 'You unstaked' : 'You unstake'}
          tokenAddress={stakedAsset}
          tokenAmount={amount}
        />
      </Card>
      <Card variant="modalSubSection">
        <SwapTokenRow
          chain={chain}
          label={shouldShowReceipt ? 'You received' : 'You receive'}
          tokenAddress={nativeAsset}
          //tokenAmount={formatUnits(unstakedAmount, 18)}
          tokenAmount="0"
        />
      </Card>
    </AnimateHeightChange>
  )
}
