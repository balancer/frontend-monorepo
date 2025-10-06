import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { LstStakeReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { BeetsTokenRow } from '../../../components/BeetsTokenRow'
import { useLoops } from '@/lib/modules/loops/LoopsProvider'

export function LoopsDepositSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LstStakeReceiptResult) {
  const { isMobile } = useBreakpoints()

  const { chain, depositTransactionSteps, loopsDepositTxHash } = useLoops()

  const shouldShowReceipt = !!loopsDepositTxHash && !isLoadingReceipt && !!receivedToken

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={depositTransactionSteps} />}
      <Card variant="modalSubSection">
        <BeetsTokenRow
          chain={chain}
          isLoading={false}
          label={shouldShowReceipt ? 'You deposited' : 'You deposit'}
          tokenAddress={''}
          tokenAmount="0"
        />
      </Card>
      <Card variant="modalSubSection">
        <BeetsTokenRow
          chain={chain}
          isLoading={isLoadingReceipt}
          label={shouldShowReceipt ? 'You received' : 'You receive'}
          tokenAddress={''}
          tokenAmount={shouldShowReceipt ? receivedToken.humanAmount : '0'}
        />
      </Card>
    </AnimateHeightChange>
  )
}
