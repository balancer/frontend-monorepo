import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useLst } from '../LstProvider'
import { LstStakeReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { LstTokenRow } from './LstTokenRow'
import { useGetConvertToShares } from '../hooks/useGetConvertToShares'
import { formatUnits, parseUnits } from 'viem'

export function LstStakeSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LstStakeReceiptResult) {
  const { isMobile } = useBreakpoints()

  const { chain, stakeTransactionSteps, lstStakeTxHash, nativeAsset, stakedAsset, amountAssets } =
    useLst()

  const { sharesAmount, isLoading: isLoadingSharesAmount } = useGetConvertToShares(
    parseUnits(amountAssets, 18),
    chain
  )

  const shouldShowReceipt = !!lstStakeTxHash && !isLoadingReceipt && !!receivedToken

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={stakeTransactionSteps} />}
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          isLoading={isLoadingSharesAmount}
          label={shouldShowReceipt ? 'You staked' : 'You stake'}
          tokenAddress={nativeAsset?.address || ''}
          tokenAmount={amountAssets}
        />
      </Card>
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          isLoading={isLoadingSharesAmount || isLoadingReceipt}
          label={shouldShowReceipt ? 'You received' : 'You receive'}
          tokenAddress={stakedAsset?.address || ''}
          tokenAmount={
            shouldShowReceipt ? receivedToken.humanAmount : formatUnits(sharesAmount, 18)
          }
        />
      </Card>
    </AnimateHeightChange>
  )
}
