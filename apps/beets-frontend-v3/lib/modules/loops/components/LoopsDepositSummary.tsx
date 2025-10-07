import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { LstStakeReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { BeetsTokenRow } from '../../../components/shared/BeetsTokenRow'
import { useLoops } from '../LoopsProvider'
import { useLoopsGetConvertToShares } from '../hooks/useLoopsGetConvertToShares'
import { formatUnits, parseUnits } from 'viem'

export function LoopsDepositSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LstStakeReceiptResult) {
  const { isMobile } = useBreakpoints()

  const {
    chain,
    depositTransactionSteps,
    loopsDepositTxHash,
    nativeAsset,
    loopedAsset,
    amountAssets,
  } = useLoops()

  const { sharesAmount, isLoading: isLoadingSharesAmount } = useLoopsGetConvertToShares(
    parseUnits(amountAssets, 18),
    chain
  )

  const shouldShowReceipt = !!loopsDepositTxHash && !isLoadingReceipt && !!receivedToken

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={depositTransactionSteps} />}
      <Card variant="modalSubSection">
        <BeetsTokenRow
          chain={chain}
          isLoading={isLoadingSharesAmount}
          label={shouldShowReceipt ? 'You deposited' : 'You deposit'}
          tokenAddress={nativeAsset?.address || ''}
          tokenAmount={amountAssets}
        />
      </Card>
      <Card variant="modalSubSection">
        <BeetsTokenRow
          chain={chain}
          isLoading={isLoadingSharesAmount || isLoadingReceipt}
          label={shouldShowReceipt ? 'You received' : 'You receive'}
          tokenAddress={loopedAsset?.address || ''}
          tokenAmount={
            shouldShowReceipt ? receivedToken.humanAmount : formatUnits(sharesAmount, 18)
          }
        />
      </Card>
    </AnimateHeightChange>
  )
}
