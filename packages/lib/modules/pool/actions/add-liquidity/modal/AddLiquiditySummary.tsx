import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { Box, Divider, Card, VStack, Button, Text } from '@chakra-ui/react'
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
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'

import { CardPopAnim } from '@repo/lib/shared/components/animations/CardPopAnim'
import { useMemo, useState } from 'react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { useRouter } from 'next/navigation'
import {
  PROPORTIONAL_ADD_DESCRIPTION,
  SlippageOptions,
  SlippageSelector,
} from '../../SlippageSelector'
import { bn } from '@repo/lib/shared/utils/numbers'

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
    wantsProportional,
  } = useAddLiquidity()
  const { pool } = usePool()
  const { isMobile } = useBreakpoints()
  const { userAddress, isLoading: isUserAddressLoading } = useUserAccount()
  const router = useRouter()

  // Order amountsIn like the form inputs which uses the tokens array.
  const [selectedSlippage, setSelectedSlippage] = useState(0)
  const amountsIn = tokens
    .map(token => humanAmountsIn.find(amount => amount.tokenAddress === token?.address))
    .filter(Boolean)
    .map(amount => ({
      ...amount,
      humanAmount: bn(amount?.humanAmount || 0)
        .times(1 - selectedSlippage)
        .toString(),
    })) as HumanTokenAmountWithAddress[]

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

  const addingInputTokenLabel = wantsProportional
    ? "You're adding at most:"
    : "You're adding (exactly)"

  const calculateSlippage = (value: SlippageOptions) => {
    if (value === 'zero') setSelectedSlippage(Number(slippage) / 100)
    else if (value === 'max') setSelectedSlippage(0)
  }

  return (
    <AnimateHeightChange spacing="ms">
      {isMobile && hasQuoteContext && (
        <MobileStepTracker chain={pool.chain} transactionSteps={transactionSteps} />
      )}

      <Card p="ms" variant="modalSubSection">
        <TokenRowGroup
          amounts={shouldShowReceipt ? sentTokens : amountsIn}
          chain={pool.chain}
          isLoading={isLoadingTokens}
          label={shouldShowReceipt || !hasQuoteContext ? 'You added' : addingInputTokenLabel}
          rightElement={
            wantsProportional && (
              <SlippageSelector
                description={PROPORTIONAL_ADD_DESCRIPTION}
                onChange={calculateSlippage}
                selectedIndex={1}
                title="Slippage Simulation on 'Proportional' Adds"
              />
            )
          }
          tokens={tokens}
          totalUSDValue={hasQuoteContext ? totalUSDValue : undefined}
        />
      </Card>

      <Card p="ms" variant="modalSubSection">
        {shouldShowReceipt ? (
          <ReceiptBptOut actualBptOut={receivedBptUnits} isLoading={isLoadingReceipt} />
        ) : (
          <QuoteBptOut isLoading={isLoadingTokens} />
        )}
      </Card>

      {shouldShowReceipt ? (
        <>
          <GasCostSummaryCard chain={pool.chain} transactionSteps={transactionSteps.steps} />
          <CardPopAnim key="staking-options">
            {isVebalPool(pool.id) ? (
              <Card variant="modalSubSection">
                <VStack align="start" spacing="md" w="full">
                  <Text>Get extra incentives with veBAL</Text>
                  <Button
                    onClick={() => router.push('/vebal/manage')}
                    size="lg"
                    variant="primary"
                    w="full"
                  >
                    Lock to get veBAL
                  </Button>
                </VStack>
              </Card>
            ) : (
              pool.staking && (
                <Box pt="sm">
                  <Divider mb="md" />
                  <StakingOptions />
                </Box>
              )
            )}
          </CardPopAnim>
        </>
      ) : hasQuoteContext ? (
        <CardPopAnim key="price-impact-details">
          <Card p="ms" variant="modalSubSection">
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
