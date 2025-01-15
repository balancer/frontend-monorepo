import { Card } from '@chakra-ui/react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useLst } from '../LstProvider'
import { LstTokenRow } from './LstTokenRow'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { BalAlertContent } from '@repo/lib/shared/components/alerts/BalAlertContent'

export function LstUnstakeSummary() {
  const { isMobile } = useBreakpoints()
  const { chain, stakeTransactionSteps, lstUnstakeTxHash, stakedAsset, amountShares } = useLst()

  const shouldShowReceipt = !!lstUnstakeTxHash

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={stakeTransactionSteps} />}
      <Card variant="modalSubSection">
        <LstTokenRow
          chain={chain}
          label={shouldShowReceipt ? 'You unstaked' : 'You unstake'}
          tokenAddress={stakedAsset?.address || ''}
          tokenAmount={amountShares}
        />
      </Card>
      <BalAlert
        content={
          <BalAlertContent
            // eslint-disable-next-line max-len
            description="After initiating the unstake, you will need to return to the UI after 14 days to claim $S on the Withdraw tab"
            forceColumnMode
            title="Please note"
          />
        }
        status="info"
      />
    </AnimateHeightChange>
  )
}
