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
import { CustomToken } from '@repo/lib/modules/tokens/token.types'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'
import { GqlSorSwapType } from '@repo/lib/shared/services/api/generated/graphql'
import {
  EXACT_IN_SWAP_DESCRIPTION,
  EXACT_OUT_SWAP_DESCRIPTION,
  SlippageOptions,
  SlippageSelector,
} from '../../pool/actions/SlippageSelector'
import { useState } from 'react'
import { useUserSettings } from '../../user/settings/UserSettingsProvider'
import { bn } from '@repo/lib/shared/utils/numbers'

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
    isLbpSwap,
    lbpToken,
    isLbpProjectTokenBuy,
    swapType,
  } = useSwap()

  const { slippage } = useUserSettings()
  const [selectedSlippage, setSelectedSlippage] = useState(
    swapType === GqlSorSwapType.ExactIn ? 0 : Number(slippage) / 100
  )
  const calculateSlippage = (value: SlippageOptions) => {
    if (value === 'zero') setSelectedSlippage(0)
    else if (value === 'max') setSelectedSlippage(Number(slippage) / 100)
  }

  const expectedTokenOut = simulationQuery?.data?.returnAmount as HumanAmount

  const shouldShowReceipt =
    !isWrap && !!swapTxHash && !isLoadingReceipt && !!receivedToken && !!sentToken
  const shouldShowErrors = hasQuoteContext ? swapTxConfirmed : swapTxHash
  const isWrapComplete = isWrap && swapTxHash && swapTxConfirmed

  const tokenInLabel =
    shouldShowReceipt || isWrapComplete
      ? 'You paid'
      : swapType === GqlSorSwapType.ExactIn
        ? 'You pay (exactly)'
        : 'You pay'

  function tokenOutLabel() {
    if (shouldShowReceipt || isWrapComplete) return 'You got'
    if (isWrap) return "You'll get"
    if (swapType === GqlSorSwapType.ExactOut) return "You'll get (exactly)"

    return "You'll get"
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

  const outTokenRightElement = () => {
    return shouldShowReceipt ? (
      slippageDiffLabel(receivedToken.humanAmount || '0', expectedTokenOut)
    ) : swapType === GqlSorSwapType.ExactIn ? (
      <SlippageSelector
        description={EXACT_IN_SWAP_DESCRIPTION}
        onChange={calculateSlippage}
        selectedIndex={0}
        title="Slippage Simulation: ‘Exact In’ Swap"
      />
    ) : undefined
  }

  const inAmountWithSlippage =
    swapType === GqlSorSwapType.ExactIn
      ? tokenIn.amount
      : bn(tokenIn.amount)
          .times(1 + selectedSlippage)
          .toString()
  const outAmountWithSlippage =
    swapType === GqlSorSwapType.ExactOut
      ? tokenOut.amount
      : bn(tokenOut.amount)
          .times(1 - selectedSlippage)
          .toString()

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={selectedChain} transactionSteps={transactionSteps} />}

      <Card variant="modalSubSection">
        <SwapTokenRow
          chain={selectedChain}
          label={tokenInLabel}
          rightElement={
            swapType === GqlSorSwapType.ExactOut && (
              <SlippageSelector
                description={EXACT_OUT_SWAP_DESCRIPTION}
                onChange={calculateSlippage}
                selectedIndex={1}
                title="Slippage Simulation: ‘Exact Out’ Swap"
              />
            )
          }
          tokenAddress={shouldShowReceipt ? sentToken.tokenAddress : tokenIn.address}
          tokenAmount={shouldShowReceipt ? sentToken.humanAmount : inAmountWithSlippage}
          {...(isLbpSwap &&
            !isLbpProjectTokenBuy && {
              customToken: lbpToken as CustomToken,
            })}
        />
      </Card>

      <Card variant="modalSubSection">
        <SwapTokenRow
          chain={selectedChain}
          label={tokenOutLabel()}
          rightElement={outTokenRightElement()}
          tokenAddress={shouldShowReceipt ? receivedToken.tokenAddress : tokenOut.address}
          tokenAmount={shouldShowReceipt ? receivedToken.humanAmount : outAmountWithSlippage}
          {...(isLbpSwap &&
            isLbpProjectTokenBuy && {
              customToken: lbpToken as CustomToken,
            })}
        />
      </Card>

      {shouldShowReceipt && (
        <GasCostSummaryCard chain={selectedChain} transactionSteps={transactionSteps.steps} />
      )}
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
                <Text color="grayText" fontSize="sm">
                  Exchange rate
                </Text>
                <SwapRate />
              </HStack>
            </Card>
          </CardPopAnim>
        </>
      )}
    </AnimateHeightChange>
  )
}
