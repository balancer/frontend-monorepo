'use client'

import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { Card, VStack, Text } from '@chakra-ui/react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'
import { CardPopAnim } from '@repo/lib/shared/components/animations/CardPopAnim'
import { useMemo } from 'react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useReliquary } from '../ReliquaryProvider'
import { getNetworkConfig } from '@repo/lib/config/networks'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

type Props = {
  claimTxHash?: string
  transactionSteps: any
  isLoadingSteps?: boolean
}

export function ReliquaryClaimAllSummary({ claimTxHash, transactionSteps, isLoadingSteps }: Props) {
  const { pool } = usePool()
  const { isMobile } = useBreakpoints()
  const { userAddress, isLoading: isUserAddressLoading } = useUserAccount()
  const { totalPendingRewardsUSD, pendingRewardsData } = useReliquary()

  const shouldShowReceipt = !!claimTxHash

  const claimTokens: HumanTokenAmountWithAddress[] = useMemo(() => {
    if (!pendingRewardsData?.rewards[0]?.amount || !pool) return []

    const networkConfig = getNetworkConfig(pool.chain as GqlChain)
    const beetsAddress = networkConfig.tokens.addresses.beets!

    return [
      {
        tokenAddress: beetsAddress,
        humanAmount: pendingRewardsData.rewards[0].amount as `${number}` | '',
        symbol: 'BEETS',
      },
    ]
  }, [pendingRewardsData, totalPendingRewardsUSD, pool])

  if (!isUserAddressLoading && !userAddress) {
    return <BalAlert content="User is not connected" status="warning" />
  }

  return (
    <AnimateHeightChange spacing="ms">
      {isMobile && <MobileStepTracker chain={pool.chain} transactionSteps={transactionSteps} />}
      <Card p="ms" variant="modalSubSection">
        <TokenRowGroup
          amounts={claimTokens}
          chain={pool.chain}
          isLoading={isLoadingSteps}
          label={shouldShowReceipt ? 'You claimed' : 'You will claim'}
          tokens={[]}
          totalUSDValue={totalPendingRewardsUSD.toString()}
        />
      </Card>
      {shouldShowReceipt ? (
        <>
          <GasCostSummaryCard chain={pool.chain} transactionSteps={transactionSteps.steps} />
          <CardPopAnim key="success-message">
            <Card variant="modalSubSection">
              <VStack align="start" spacing="md" w="full">
                <Text color="font.highlight">You've successfully claimed all rewards!</Text>
                <Text color="font.secondary" fontSize="sm">
                  Your BEETS rewards have been transferred to your wallet. Return to the maBEETS
                  page to manage your Relics.
                </Text>
              </VStack>
            </Card>
          </CardPopAnim>
        </>
      ) : null}
    </AnimateHeightChange>
  )
}
