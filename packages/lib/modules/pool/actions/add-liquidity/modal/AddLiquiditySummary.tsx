'use client'

import { Card, VStack, Button, Text, useDisclosure } from '@chakra-ui/react'
import { usePool } from '../../../PoolProvider'
import { PoolActionsPriceImpactDetails } from '../../PoolActionsPriceImpactDetails'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { QuoteBptOut, ReceiptBptOut } from './BptOut'
import { StakingOptions } from './StakingOptions'
import { isVebalPool } from '../../../pool.helpers'
import { useMemo } from 'react'
import { BalAlert } from '../../../../../shared/components/alerts/BalAlert'
import { CardPopAnim } from '../../../../../shared/components/animations/CardPopAnim'
import { AnimateHeightChange } from '../../../../../shared/components/modals/AnimatedModalBody'
import { useBreakpoints } from '../../../../../shared/hooks/useBreakpoints'
import { HumanTokenAmountWithAddress } from '../../../../tokens/token.types'
import { TokenRowGroup } from '../../../../tokens/TokenRow/TokenRowGroup'
import { AddLiquidityReceiptResult } from '../../../../transactions/transaction-steps/receipts/receipt.hooks'
import { MobileStepTracker } from '../../../../transactions/transaction-steps/step-tracker/MobileStepTracker'
import { VebalRedirectModal } from '../../../../vebal/VebalRedirectModal'
import { useUserAccount } from '../../../../web3/UserAccountProvider'

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
    return <BalAlert status="warning" content="User is not connected" />
  }
  if (shouldShowErrors && error) {
    return <BalAlert status="warning" content="We were unable to find this transaction hash" />
  }
  if (shouldShowErrors && !isLoadingReceipt && !sentTokens.length) {
    return (
      <BalAlert
        status="warning"
        content="We were unable to find logs for this transaction hash and the connected account"
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
          label={shouldShowReceipt || !hasQuoteContext ? 'You added' : "You're adding"}
          amounts={shouldShowReceipt ? sentTokens : amountsIn}
          totalUSDValue={hasQuoteContext ? totalUSDValue : undefined}
          chain={pool.chain}
          tokens={tokens}
          isLoading={isLoadingTokens}
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
          {pool.staking && (
            <Card variant="modalSubSection" w="full">
              <StakingOptions />
            </Card>
          )}
          {isVebalPool(pool.id) && (
            <Card variant="modalSubSection">
              <VStack align="start" w="full" spacing="md">
                <Text>Get extra incentives with veBAL</Text>
                <Button variant="primary" size="lg" onClick={vebalRedirectModal.onOpen} w="full">
                  Lock to get veBAL
                </Button>
              </VStack>

              <VebalRedirectModal
                isOpen={vebalRedirectModal.isOpen}
                onClose={vebalRedirectModal.onClose}
              />
            </Card>
          )}
        </CardPopAnim>
      ) : hasQuoteContext ? (
        <CardPopAnim key="price-impact-details">
          <Card variant="modalSubSection">
            <VStack align="start" spacing="sm">
              <PoolActionsPriceImpactDetails
                totalUSDValue={totalUSDValue}
                bptAmount={simulationQuery.data?.bptOut.amount}
                isAddLiquidity
              />
            </VStack>
          </Card>
        </CardPopAnim>
      ) : null}
    </AnimateHeightChange>
  )
}