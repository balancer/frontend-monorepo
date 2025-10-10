import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { LoopsWithdrawReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { BeetsTokenRow } from '../../../components/shared/BeetsTokenRow'
import { useLoops } from '../LoopsProvider'
import { formatUnits } from 'viem'
import { useLoopsGetFlyQuote } from '@/lib/modules/loops/hooks/useLoopsGetFlyQuote'

export function LoopsWithdrawSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LoopsWithdrawReceiptResult) {
  const { isMobile } = useBreakpoints()

  const {
    chain,
    depositTransactionSteps,
    loopsWithdrawTxHash,
    wNativeAsset,
    loopedAsset,
    amountShares,
  } = useLoops()

  const { wethAmountOut, isLoading: isLoadingFlyQuote } = useLoopsGetFlyQuote(amountShares, chain)

  const shouldShowReceipt = !!loopsWithdrawTxHash && !isLoadingReceipt && !!receivedToken

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={depositTransactionSteps} />}
      <Card variant="modalSubSection">
        <BeetsTokenRow
          chain={chain}
          isLoading={false}
          label={shouldShowReceipt ? 'You withdrew' : 'You withdraw'}
          tokenAddress={loopedAsset?.address || ''}
          tokenAmount={amountShares}
        />
      </Card>
      <Card variant="modalSubSection">
        <BeetsTokenRow
          chain={chain}
          isLoading={isLoadingFlyQuote || isLoadingReceipt}
          label={shouldShowReceipt ? 'You received' : 'You receive'}
          tokenAddress={wNativeAsset?.address || ''}
          tokenAmount={
            shouldShowReceipt
              ? receivedToken.humanAmount
              : formatUnits(wethAmountOut, wNativeAsset?.decimals ?? 18)
          }
        />
      </Card>
    </AnimateHeightChange>
  )
}
