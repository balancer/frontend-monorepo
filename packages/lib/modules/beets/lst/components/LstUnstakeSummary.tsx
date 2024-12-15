import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useLst } from '../LstProvider'
import { LstStakeReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { useGetRate } from '../hooks/useGetRate'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { LstTokenRow } from './LstTokenRow'

export function LstUnstakeSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
}: LstStakeReceiptResult) {
  const { isMobile } = useBreakpoints()

  const { chain, stakeTransactionSteps, lstUnstakeTxHash, nativeAsset, stakedAsset, amount } =
    useLst()

  const { rate, isLoading: isLoadingRate } = useGetRate(chain)

  const estimatedAmount = bn(amount).times(rate).toString() // TODO: maybe get this from the wrID after the tx is confirmed
  const shouldShowReceipt = !!lstUnstakeTxHash && !isLoadingReceipt && !!receivedToken
  const isLoading = isLoadingReceipt || isLoadingRate

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={stakeTransactionSteps} />}
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          isLoading={isLoading}
          label={shouldShowReceipt ? 'You unstaked' : 'You unstake'}
          tokenAddress={stakedAsset?.address || ''}
          tokenAmount={amount}
        />
      </Card>
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          isLoading={isLoading}
          label="You will receive (estimated)"
          tokenAddress={nativeAsset?.address || ''}
          tokenAmount={fNum('token', estimatedAmount)}
        />
      </Card>
    </AnimateHeightChange>
  )
}
