import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useLst } from '../LstProvider'
import { LstStakeReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { LstTokenRow } from './LstTokenRow'
import { useGetStakedAmountPreview } from '../hooks/useGetStakedAmountPreview'
import { formatUnits, parseUnits } from 'viem'

export function LstStakeSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LstStakeReceiptResult) {
  const { isMobile } = useBreakpoints()

  const { chain, stakeTransactionSteps, lstStakeTxHash, nativeAsset, stakedAsset, amount } =
    useLst()

  const { stakedAmountPreview, isLoading: isLoadingStakedAmountPreview } =
    useGetStakedAmountPreview(parseUnits(amount, 18), chain)

  const shouldShowReceipt = !!lstStakeTxHash && !isLoadingReceipt && !!receivedToken

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={stakeTransactionSteps} />}
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          isLoading={isLoadingStakedAmountPreview}
          label={shouldShowReceipt ? 'You staked' : 'You stake'}
          tokenAddress={nativeAsset?.address || ''}
          tokenAmount={amount}
        />
      </Card>
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          isLoading={isLoadingStakedAmountPreview || isLoadingReceipt}
          label={shouldShowReceipt ? 'You received' : 'You receive'}
          tokenAddress={stakedAsset?.address || ''}
          tokenAmount={
            shouldShowReceipt ? receivedToken[0].humanAmount : formatUnits(stakedAmountPreview, 18)
          }
        />
      </Card>
    </AnimateHeightChange>
  )
}
