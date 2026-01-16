'use client'

import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { Card, VStack, Text, Alert, AlertIcon } from '@chakra-ui/react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'
import { CardPopAnim } from '@repo/lib/shared/components/animations/CardPopAnim'
import { useMemo } from 'react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { formatUnits } from 'viem'
import { useGetPendingReward } from '../hooks/useGetPendingReward'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

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
  const { pool } = usePool()
  const { isMobile } = useBreakpoints()
  const { userAddress, isLoading: isUserAddressLoading } = useUserAccount()
  const { data: pendingRewards, usdValue: pendingRewardsUsdValue } = useGetPendingReward(relicId)

  const shouldShowReceipt = !!claimTxHash

  const claimTokens: HumanTokenAmountWithAddress[] = useMemo(() => {
    if (!pendingRewards || !pool) return []

    const networkConfig = getNetworkConfig(pool.chain as GqlChain)
    const beetsAddress = networkConfig.tokens.addresses.beets!

    return [
      {
        tokenAddress: beetsAddress,
        humanAmount: formatUnits(pendingRewards || 0n, 18),
        symbol: 'BEETS',
        usdValue: pendingRewardsUsdValue.toNumber(),
      },
    ]
  }, [pendingRewards, pendingRewardsUsdValue, pool])

  if (!isUserAddressLoading && !userAddress) {
    return <BalAlert content="User is not connected" status="warning" />
  }

  return (
    <AnimateHeightChange spacing="ms">
      {isMobile && <MobileStepTracker chain={pool.chain} transactionSteps={transactionSteps} />}
      {!shouldShowReceipt && pendingRewardsUsdValue.eq(0) && (
        <Alert mb="sm" status="warning">
          <AlertIcon />
          <Text color="black" fontSize="sm">
            No rewards available to claim from Relic #{relicId}
          </Text>
        </Alert>
      )}
      <Card p="ms" variant="modalSubSection">
        <TokenRowGroup
          amounts={claimTokens}
          chain={pool.chain}
          isLoading={isLoadingSteps}
          label={shouldShowReceipt ? 'You claimed' : 'You will claim'}
          tokens={[]}
          totalUSDValue={pendingRewardsUsdValue.toString()}
        />
      </Card>
      {shouldShowReceipt ? (
        <>
          <GasCostSummaryCard chain={pool.chain} transactionSteps={transactionSteps.steps} />
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
