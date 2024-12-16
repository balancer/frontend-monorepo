import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useLst } from '../LstProvider'
import { LstStakeReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { LstTokenRow } from './LstTokenRow'
import { useGetConvertToAssets } from '../hooks/useGetConvertToAssets'
import { formatUnits, parseUnits } from 'viem'

export function LstUnstakeSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LstStakeReceiptResult) {
  const { isMobile } = useBreakpoints()

  const { chain, stakeTransactionSteps, lstUnstakeTxHash, nativeAsset, stakedAsset, amountShares } =
    useLst()

  const { assetsAmount, isLoading: isLoadingAssets } = useGetConvertToAssets(
    parseUnits(amountShares, 18),
    chain
  )

  const shouldShowReceipt = !!lstUnstakeTxHash && !isLoadingReceipt && !!receivedToken
  const isLoading = isLoadingReceipt || isLoadingAssets

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={stakeTransactionSteps} />}
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          isLoading={isLoading}
          label={shouldShowReceipt ? 'You unstaked' : 'You unstake'}
          tokenAddress={stakedAsset?.address || ''}
          tokenAmount={amountShares}
        />
      </Card>
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          isLoading={isLoading}
          label="You will receive (estimated)"
          tokenAddress={nativeAsset?.address || ''}
          tokenAmount={formatUnits(assetsAmount, 18)}
        />
      </Card>
    </AnimateHeightChange>
  )
}
