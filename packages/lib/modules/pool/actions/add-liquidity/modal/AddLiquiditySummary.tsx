'use client'

import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { Card, VStack, Button, Text, useDisclosure } from '@chakra-ui/react'
import { usePool } from '../../../PoolProvider'
import { PoolActionsPriceImpactDetails } from '../../PoolActionsPriceImpactDetails'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { QuoteBptOut, ReceiptBptOut } from './BptOut'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { AddLiquidityReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { StakingOptions } from './StakingOptions'
import { isVebalPool } from '../../../pool.helpers'
import { VebalRedirectModal } from '@repo/lib/modules/vebal/VebalRedirectModal'

import { CardPopAnim } from '@repo/lib/shared/components/animations/CardPopAnim'
import { useMemo } from 'react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'

export function AddLiquiditySummary({
  isLoading: isLoadingReceipt,
  error,
  sentTokens,
  receivedBptUnits,
}: AddLiquidityReceiptResult) {
  const {
    totalUSDValue,
    simulationQuery,
    transactionSteps,
    humanAmountsIn,
    hasQuoteContext,
    tokens,
    addLiquidityTxHash,
    addLiquidityTxSuccess,
    slippage,
  } = useAddLiquidity()
  const { pool } = usePool()
  const { isMobile } = useBreakpoints()
  const { userAddress, isLoading: isUserAddressLoading } = useUserAccount()
  const vebalRedirectModal = useDisclosure()

  // Order amountsIn like the form inputs which uses the tokens array.
  const amountsIn = tokens
    .map(token => humanAmountsIn.find(amount => amount.tokenAddress === token?.address))
    .filter(Boolean) as HumanTokenAmountWithAddress[]

  const shouldShowErrors = hasQuoteContext ? addLiquidityTxSuccess : addLiquidityTxHash
  const shouldShowReceipt = addLiquidityTxHash && !isLoadingReceipt && sentTokens.length > 0

  const isLoadingTokens = useMemo(() => {
    if (hasQuoteContext) return shouldShowReceipt && isLoadingReceipt
    return isLoadingReceipt
  }, [hasQuoteContext, isLoadingReceipt, shouldShowReceipt])

  if (!isUserAddressLoading && !userAddress) {
    return <BalAlert content="User is not connected" status="warning" />
  }
  if (shouldShowErrors && error) {
    return <BalAlert content="We were unable to find this transaction hash" status="warning" />
  }
  if (shouldShowErrors && !isLoadingReceipt && !sentTokens.length) {
    return (
      <BalAlert
        content="We were unable to find logs for this transaction hash and the connected account"
        status="warning"
      />
    )
  }

  return (
    <AnimateHeightChange spacing="sm">
      {isMobile && hasQuoteContext && (
        <MobileStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
      )}

      <Card variant="modalSubSection">
        <TokenRowGroup
          amounts={shouldShowReceipt ? sentTokens : amountsIn}
          chain={pool.chain}
          isLoading={isLoadingTokens}
          label={shouldShowReceipt || !hasQuoteContext ? 'You added' : "You're adding"}
          tokens={tokens}
          totalUSDValue={hasQuoteContext ? totalUSDValue : undefined}
        />
      </Card>

      <Card variant="modalSubSection">
        {shouldShowReceipt ? (
          <ReceiptBptOut actualBptOut={receivedBptUnits} isLoading={isLoadingReceipt} />
        ) : (
          <QuoteBptOut isLoading={isLoadingTokens} />
        )}
      </Card>

      {shouldShowReceipt ? (
        <CardPopAnim key="staking-options">
          {isVebalPool(pool.id) ? (
            <Card variant="modalSubSection">
              <VStack align="start" spacing="md" w="full">
                <Text>Get extra incentives with veBAL</Text>
                <Button onClick={vebalRedirectModal.onOpen} size="lg" variant="primary" w="full">
                  Lock to get veBAL
                </Button>
              </VStack>

              <VebalRedirectModal
                isOpen={vebalRedirectModal.isOpen}
                onClose={vebalRedirectModal.onClose}
              />
            </Card>
          ) : (
            pool.staking && (
              <Card variant="modalSubSection" w="full">
                <StakingOptions />
              </Card>
            )
          )}
        </CardPopAnim>
      ) : hasQuoteContext ? (
        <CardPopAnim key="price-impact-details">
          <Card variant="modalSubSection">
            <VStack align="start" spacing="sm">
              <PoolActionsPriceImpactDetails
                bptAmount={simulationQuery.data?.bptOut.amount}
                isAddLiquidity
                isSummary
                slippage={slippage}
                totalUSDValue={totalUSDValue}
              />
            </VStack>
          </Card>
        </CardPopAnim>
      ) : null}
    </AnimateHeightChange>
  )
}
