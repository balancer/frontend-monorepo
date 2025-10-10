import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { LoopsWithdrawReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { BeetsTokenRow } from '../../../components/shared/BeetsTokenRow'
import { useLoops } from '../LoopsProvider'
import { formatUnits, parseUnits } from 'viem'
import { useLoopsGetConvertToAssets } from '../hooks/useLoopsGetConvertToAssets'

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

  const { assetsAmount, isLoading: isLoadingAssetsAmount } = useLoopsGetConvertToAssets(
    amountShares && wNativeAsset?.decimals ? parseUnits(amountShares, wNativeAsset.decimals) : 0n,
    chain
  )

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
          isLoading={isLoadingAssetsAmount || isLoadingReceipt}
          label={shouldShowReceipt ? 'You received' : 'You receive'}
          tokenAddress={wNativeAsset?.address || ''}
          tokenAmount={
            shouldShowReceipt
              ? receivedToken.humanAmount
              : formatUnits(assetsAmount, wNativeAsset?.decimals ?? 18)
          }
        />
      </Card>
    </AnimateHeightChange>
  )
}
