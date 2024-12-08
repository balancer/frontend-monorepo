import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useLst } from '../LstProvider'
import { LstStakeReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { SwapTokenRow } from '@repo/lib/modules/tokens/TokenRow/SwapTokenRow'
import { useGetStakedAmountPreview } from '../hooks/useGetStakedAmountPreview'
import { formatUnits, parseUnits } from 'viem'

export function LstStakeSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LstStakeReceiptResult) {
  const { isMobile } = useBreakpoints()

  const { chain, stakeTransactionSteps, lstStakeTxHash, nativeAsset, stakedAsset, amount } =
    useLst()

  const { stakedAmountPreview } = useGetStakedAmountPreview(parseUnits(amount, 18), chain)

  const shouldShowReceipt = !!lstStakeTxHash && !isLoadingReceipt && !!receivedToken

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
          tokenAmount={
            shouldShowReceipt ? receivedToken[0].humanAmount : formatUnits(stakedAmountPreview, 18)
          }
        />
      </Card>
    </AnimateHeightChange>
  )
}
