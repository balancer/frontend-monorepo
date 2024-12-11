import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useLst } from '../LstProvider'
import { LstWithdrawReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { LstTokenRow } from './LstTokenRow'

export function LstWithdrawSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LstWithdrawReceiptResult) {
  const { isMobile } = useBreakpoints()

  const { chain, withdrawTransactionSteps, lstWithdrawTxHash, nativeAsset, amount } = useLst()

  const shouldShowReceipt = !!lstWithdrawTxHash && !isLoadingReceipt && !!receivedToken
  const isLoading = isLoadingReceipt

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={withdrawTransactionSteps} />}
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          isLoading={isLoading}
          label={shouldShowReceipt ? 'You withdrew' : 'You withdraw'}
          tokenAddress={nativeAsset?.address || ''}
          tokenAmount={amount}
        />
      </Card>
    </AnimateHeightChange>
  )
}
