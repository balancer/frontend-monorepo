import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { Card, HStack, Text } from '@chakra-ui/react'
import { SwapTokenRow } from '../../tokens/TokenRow/SwapTokenRow'
import { MobileStepTracker } from '../../transactions/transaction-steps/step-tracker/MobileStepTracker'
import { SwapDetails } from '../SwapDetails'
import { SwapRate } from '../SwapRate'
import { useSwap } from '../SwapProvider'
import { SwapReceiptResult } from '../../transactions/transaction-steps/receipts/receipt.hooks'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { HumanAmount } from '@balancer/sdk'
import { slippageDiffLabel } from '@repo/lib/shared/utils/slippage'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { CardPopAnim } from '@repo/lib/shared/components/animations/CardPopAnim'

export function SwapSummary({
  isLoading: isLoadingReceipt,
  receivedToken,
  sentToken,
  error,
}: SwapReceiptResult) {
  const { isMobile } = useBreakpoints()
  const { userAddress, isLoading: isUserAddressLoading } = useUserAccount()
  const {
    tokenIn,
    tokenOut,
    transactionSteps,
    selectedChain,
    isWrap,
    swapTxHash,
    swapTxConfirmed,
    simulationQuery,
    hasQuoteContext,
  } = useSwap()

  const expectedTokenOut = simulationQuery?.data?.returnAmount as HumanAmount

  const shouldShowReceipt =
    !isWrap && !!swapTxHash && !isLoadingReceipt && !!receivedToken && !!sentToken
  const shouldShowErrors = hasQuoteContext ? swapTxConfirmed : swapTxHash
  const isWrapComplete = isWrap && swapTxHash && swapTxConfirmed

  function tokenOutLabel() {
    if (shouldShowReceipt || isWrapComplete) return 'You got'
    if (isWrap) return "You'll get"
    return "You'll get (if no slippage)"
  }

  if (!isUserAddressLoading && !userAddress) {
    return <BalAlert content="User is not connected" status="warning" />
  }
  if (shouldShowErrors && error) {
    return <BalAlert content="We were unable to find this transaction hash" status="warning" />
  }
  if (shouldShowErrors && !isLoadingReceipt && (!receivedToken || !sentToken)) {
    return (
      <BalAlert
        content="We were unable to find logs for this transaction hash and the connected account"
        status="warning"
      />
    )
  }

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={selectedChain} transactionSteps={transactionSteps} />}

      <Card variant="modalSubSection">
        <SwapTokenRow
          chain={selectedChain}
          label={shouldShowReceipt || isWrapComplete ? 'You paid' : 'You pay'}
          tokenAddress={shouldShowReceipt ? sentToken.tokenAddress : tokenIn.address}
          tokenAmount={shouldShowReceipt ? sentToken.humanAmount : tokenIn.amount}
        />
      </Card>

      <Card variant="modalSubSection">
        <SwapTokenRow
          chain={selectedChain}
          label={tokenOutLabel()}
          rightLabel={
            shouldShowReceipt
              ? slippageDiffLabel(receivedToken.humanAmount || '0', expectedTokenOut)
              : undefined
          }
          tokenAddress={shouldShowReceipt ? receivedToken.tokenAddress : tokenOut.address}
          tokenAmount={shouldShowReceipt ? receivedToken.humanAmount : tokenOut.amount}
        />
      </Card>

      {!shouldShowReceipt && !isWrapComplete && (
        <>
          <CardPopAnim key="swap-details">
            {!swapTxHash && (
              <Card variant="modalSubSection">
                <SwapDetails />
              </Card>
            )}
          </CardPopAnim>
          <CardPopAnim key="exchange-rate">
            <Card fontSize="sm" variant="modalSubSection">
              <HStack justify="space-between" w="full">
                <Text color="grayText">Exchange rate</Text>
                <SwapRate />
              </HStack>
            </Card>
          </CardPopAnim>
        </>
      )}
    </AnimateHeightChange>
  )
}
