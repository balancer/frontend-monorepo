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
import { useReliquaryAddLiquidityMaturityImpact } from '../hooks/useReliquaryAddLiquidityMaturityImpact'
import { intervalToDuration, formatDuration } from 'date-fns'
import { formatUnits } from 'viem'
import { BPT_DECIMALS } from '@repo/lib/modules/pool/pool.constants'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

type Props = AddLiquidityReceiptResult & {
  createNew: boolean
  relicId?: string
}

export function ReliquaryAddLiquiditySummary({
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
  const { toCurrency } = useCurrency()

  // Calculate add liquidity impact based on simulated BPT amount
  const bptAmount = simulationQuery.data?.bptOut
    ? bn(formatUnits(simulationQuery.data.bptOut.amount, BPT_DECIMALS)).toNumber()
    : 0

  const addLiquidityMaturityImpactQuery = useReliquaryAddLiquidityMaturityImpact(
    bptAmount,
    createNew ? undefined : relicId
  )

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

  const addLiquidityMaturityImpact = addLiquidityMaturityImpactQuery.data
  const showAddLiquidityMaturityImpactWarning =
    !createNew && relicId && addLiquidityMaturityImpact && !addLiquidityMaturityImpact.staysMax

  const maturityDuration = useMemo(() => {
    if (!addLiquidityMaturityImpact) return null
    const duration = intervalToDuration({
      start: 0,
      end: addLiquidityMaturityImpact.addLiquidityMaturityImpactTimeInMilliseconds,
    })
    return formatDuration(duration, { delimiter: ', ' })
  }, [addLiquidityMaturityImpact])

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
      {showAddLiquidityMaturityImpactWarning && !shouldShowReceipt && (
        <Alert mb="sm" status="warning">
          <AlertIcon />
          <Text color="black" fontSize="sm">
            Adding {toCurrency(totalUSDValue)} to this Relic will affect its maturity. It will take
            an additional {maturityDuration} to reach maximum maturity.
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
            label={createNew ? 'Created Relic with' : `Added liquidity to Relic #${relicId}`}
          />
        ) : (
          <QuoteBptOut
            isLoading={isLoadingTokens}
            label={createNew ? 'Creating Relic with' : `Adding liquidity to Relic #${relicId}`}
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
                    ? "You've successfully created a new Relic and added liquidity to it!"
                    : `You've successfully added liquidity to Relic #${relicId}!`}
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
