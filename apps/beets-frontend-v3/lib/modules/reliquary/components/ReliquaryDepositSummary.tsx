'use client'

import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { Card, VStack, Text, Alert, AlertIcon } from '@chakra-ui/react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { PoolActionsPriceImpactDetails } from '@repo/lib/modules/pool/actions/PoolActionsPriceImpactDetails'
import { useAddLiquidity } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import {
  QuoteBptOut,
  ReceiptBptOut,
} from '@repo/lib/modules/pool/actions/add-liquidity/modal/BptOut'
import { TokenRowGroup } from '@repo/lib/modules/tokens/TokenRow/TokenRowGroup'
import { HumanTokenAmountWithSymbol } from '@repo/lib/modules/tokens/token.types'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { AddLiquidityReceiptResult } from '@repo/lib/modules/transactions/transaction-steps/receipts/receipt.hooks'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'
import { CardPopAnim } from '@repo/lib/shared/components/animations/CardPopAnim'
import { useMemo, useState } from 'react'
import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import {
  PROPORTIONAL_ADD_DESCRIPTION,
  SlippageOptions,
  SlippageSelector,
} from '@repo/lib/modules/pool/actions/SlippageSelector'
import { bn } from '@repo/lib/shared/utils/numbers'
import { useReliquaryDepositImpact } from '../hooks/useReliquaryDepositImpact'
import { intervalToDuration, formatDuration } from 'date-fns'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { formatUnits } from 'viem'
import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'

type Props = AddLiquidityReceiptResult & {
  createNew: boolean
  relicId?: string
}

export function ReliquaryDepositSummary({
  isLoading: isLoadingReceipt,
  error,
  sentTokens,
  receivedBptUnits,
  createNew,
  relicId,
}: Props) {
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

  // Calculate deposit impact based on simulated BPT amount
  const bptAmount = simulationQuery.data?.bptOut
    ? bn(formatUnits(simulationQuery.data.bptOut.amount, BPT_DECIMALS)).toNumber()
    : 0

  const depositImpactQuery = useReliquaryDepositImpact(bptAmount, createNew ? undefined : relicId)

  // Order amountsIn like the form inputs which uses the tokens array
  const [selectedSlippage, setSelectedSlippage] = useState(0)
  const amountsIn = tokens
    .map(token => humanAmountsIn.find(amount => amount.tokenAddress === token?.address))
    .filter(Boolean)
    .map(amount => ({
      ...amount,
      humanAmount: bn(amount?.humanAmount || 0)
        .times(1 - selectedSlippage)
        .toString(),
    })) as HumanTokenAmountWithSymbol[]

  const shouldShowErrors = hasQuoteContext ? addLiquidityTxSuccess : addLiquidityTxHash
  const shouldShowReceipt = addLiquidityTxHash && !isLoadingReceipt && sentTokens.length > 0

  const isLoadingTokens = useMemo(() => {
    if (hasQuoteContext) return shouldShowReceipt && isLoadingReceipt
    return isLoadingReceipt
  }, [hasQuoteContext, isLoadingReceipt, shouldShowReceipt])

  const depositImpact = depositImpactQuery.data
  const showDepositImpactWarning = !createNew && relicId && depositImpact && !depositImpact.staysMax

  const maturityDuration = useMemo(() => {
    if (!depositImpact) return null
    const duration = intervalToDuration({
      start: 0,
      end: depositImpact.depositImpactTimeInMilliseconds,
    })
    return formatDuration(duration, { delimiter: ', ' })
  }, [depositImpact])

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
      {showDepositImpactWarning && !shouldShowReceipt && (
        <Alert mb="sm" status="warning">
          <AlertIcon />
          <Text color="black" fontSize="sm">
            Depositing {fNum('fiat', totalUSDValue)} into this Relic will affect its maturity. It
            will take an additional {maturityDuration} to reach maximum maturity.
          </Text>
        </Alert>
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
                title="Slippage Simulation: 'Proportional' Add"
              />
            )
          }
          tokens={tokens}
          totalUSDValue={hasQuoteContext ? totalUSDValue : undefined}
        />
      </Card>
      <Card p="ms" variant="modalSubSection">
        {shouldShowReceipt ? (
          <ReceiptBptOut
            actualBptOut={
              receivedBptUnits === '0' && simulationQuery.data?.bptOut
                ? formatUnits(simulationQuery.data.bptOut.amount, BPT_DECIMALS)
                : receivedBptUnits
            }
            isLoading={isLoadingReceipt}
            label={createNew ? 'Created Relic with' : `Deposited into Relic #${relicId}`}
          />
        ) : (
          <QuoteBptOut
            isLoading={isLoadingTokens}
            label={createNew ? 'Creating Relic with' : `Depositing into Relic #${relicId}`}
          />
        )}
      </Card>
      {shouldShowReceipt ? (
        <>
          <GasCostSummaryCard chain={pool.chain} transactionSteps={transactionSteps.steps} />
          <CardPopAnim key="success-message">
            <Card variant="modalSubSection">
              <VStack align="start" spacing="md" w="full">
                <Text color="font.highlight">
                  {createNew
                    ? "You've successfully created a new Relic and deposited into it!"
                    : `You've successfully deposited into Relic #${relicId}!`}
                </Text>
                <Text color="font.secondary" fontSize="sm">
                  Your maBEETS are now earning rewards. Return to the maBEETS page to manage your
                  Relic.
                </Text>
              </VStack>
            </Card>
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
