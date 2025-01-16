import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useLst } from '../LstProvider'
import { LstWithdrawReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { LstTokenRow } from './LstTokenRow'
import { formatUnits } from 'viem'

export function LstWithdrawSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LstWithdrawReceiptResult) {
  const { isMobile } = useBreakpoints()
  const { chain, withdrawTransactionSteps, lstWithdrawTxHash, nativeAsset, amountWithdraw } =
    useLst()

  const shouldShowReceipt = !!lstWithdrawTxHash && !isLoadingReceipt && !!receivedToken
  const isLoading = isLoadingReceipt

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={withdrawTransactionSteps} />}
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          isLoading={isLoading}
          label={shouldShowReceipt ? 'You received' : 'You will receive (estimated)'}
          tokenAddress={nativeAsset?.address || ''}
          tokenAmount={
            shouldShowReceipt
              ? receivedToken.humanAmount
              : formatUnits(amountWithdraw, nativeAsset?.decimals || 18).toString()
          }
        />
      </Card>
    </AnimateHeightChange>
  )
}
