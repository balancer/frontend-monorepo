import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { Card, VStack, Text } from '@chakra-ui/react'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'
import { CardPopAnim } from '@repo/lib/shared/components/animations/CardPopAnim'
import { useMemo } from 'react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useReliquary } from '../ReliquaryProvider'

type Props = {
  relicId: string
  claimTxHash?: string
  transactionSteps: any
  isLoadingSteps?: boolean
}

export function ReliquaryClaimSummary({
  relicId,
  claimTxHash,
  transactionSteps,
  isLoadingSteps,
}: Props) {
  const { isMobile } = useBreakpoints()
  const { userAddress, isLoading: isUserAddressLoading } = useUserAccount()
  const { chain, pendingRewardsByRelicId, beetsPrice, beetsAddress } = useReliquary()
  const pendingRewardsAmount = pendingRewardsByRelicId[relicId] ?? '0'
  const pendingRewardsUsdValue = bn(pendingRewardsAmount).times(beetsPrice)

  const shouldShowReceipt = !!claimTxHash

  const claimTokens: HumanTokenAmountWithSymbol[] = useMemo(() => {
    if (!pendingRewardsAmount || pendingRewardsUsdValue.eq(0)) return []

    return [
      {
        tokenAddress: beetsAddress,
        humanAmount: pendingRewardsAmount as `${number}` | '',
        symbol: 'BEETS',
      },
    ]
  }, [pendingRewardsAmount, pendingRewardsUsdValue, chain, beetsAddress])

  if (!isUserAddressLoading && !userAddress) {
    return <BalAlert content="User is not connected" status="warning" />
  }

  return (
    <AnimateHeightChange spacing="ms">
      {isMobile && <MobileStepTracker chain={chain} transactionSteps={transactionSteps} />}
      {!shouldShowReceipt && pendingRewardsUsdValue.eq(0) && (
        <BalAlert
          content={`No rewards available to claim from Relic #${relicId}`}
          mb="sm"
          status="warning"
        />
      )}
      <Card p="ms" variant="modalSubSection">
        <TokenRowGroup
          amounts={claimTokens}
          chain={chain}
          isLoading={isLoadingSteps}
          label={shouldShowReceipt ? 'You claimed' : 'You will claim'}
          tokens={[]}
          totalUSDValue={pendingRewardsUsdValue.toString()}
        />
      </Card>
      {shouldShowReceipt ? (
        <>
          <GasCostSummaryCard chain={chain} transactionSteps={transactionSteps.steps} />
          <CardPopAnim key="success-message">
            <Card variant="modalSubSection">
              <VStack align="start" spacing="md" w="full">
                <Text color="font.highlight">
                  You've successfully claimed rewards from Relic #{relicId}!
                </Text>
                <Text color="font.secondary" fontSize="sm">
                  Your BEETS rewards have been transferred to your wallet. Return to the maBEETS
                  page to manage your Relic.
                </Text>
              </VStack>
            </Card>
          </CardPopAnim>
        </>
      ) : null}
    </AnimateHeightChange>
  )
}
