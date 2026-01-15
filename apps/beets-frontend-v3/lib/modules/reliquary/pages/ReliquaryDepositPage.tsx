'use client'

import {
  Box,
  Button,
  Card,
  CardHeader,
  Grid,
  GridItem,
  HStack,
  Skeleton,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import {
  requiresProportionalInput,
  supportsNestedActions,
} from '@repo/lib/modules/pool/actions/LiquidityActionHelpers'
import { PoolActionsLayout } from '@repo/lib/modules/pool/actions/PoolActionsLayout'
import { PoolActionsPriceImpactDetails } from '@repo/lib/modules/pool/actions/PoolActionsPriceImpactDetails'
import { useAddLiquidity } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { AddLiquidityFormCheckbox } from '@repo/lib/modules/pool/actions/add-liquidity/form/AddLiquidityFormCheckbox'
import { AddLiquidityFormTabs } from '@repo/lib/modules/pool/actions/add-liquidity/form/AddLiquidityFormTabs'
import { AddLiquidityPotentialWeeklyYield } from '@repo/lib/modules/pool/actions/add-liquidity/form/AddLiquidityPotentialWeeklyYield'
import { useGetPoolRewards } from '@repo/lib/modules/pool/useGetPoolRewards'
import { PriceImpactAccordion } from '@repo/lib/modules/price-impact/PriceImpactAccordion'
import { usePriceImpact } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { cannotCalculatePriceImpactError } from '@repo/lib/modules/price-impact/price-impact.utils'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TransactionSettings } from '@repo/lib/modules/user/settings/TransactionSettings'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { fNum, formatFalsyValueAsDash } from '@repo/lib/shared/utils/numbers'
import { useEffect, useRef, useState } from 'react'
import { ReliquaryDepositImpactWarning } from '../components/ReliquaryDepositImpactWarning'
import { useReliquaryDepositImpact } from '../hooks/useReliquaryDepositImpact'
import { ReliquaryDepositModal } from '../components/ReliquaryDepositModal'

export function ReliquaryDepositPage({ relicId }: { relicId?: string }) {
  const { validTokens } = useAddLiquidity()

  return (
    <PoolActionsLayout redirectPath={`/mabeets${relicId ? `?focusRelic=${relicId}` : ''}`}>
      <TokenBalancesProvider extTokens={validTokens}>
        <ReliquaryDepositForm relicId={relicId} />
      </TokenBalancesProvider>
    </PoolActionsLayout>
  )
}

function ReliquaryDepositForm({ relicId }: { relicId?: string }) {
  const [tabIndex, setTabIndex] = useState(0)
  const nextBtn = useRef(null)

  const {
    priceImpactQuery,
    simulationQuery,
    isDisabled,
    disabledReason,
    showAcceptPoolRisks,
    totalUSDValue,
    addLiquidityTxHash,
    setNeedsToAcceptHighPI,
    refetchQuote,
    previewModalDisclosure,
    slippage,
    setWantsProportional,
    wantsProportional,
  } = useAddLiquidity()

  const createNew = !relicId

  // Calculate deposit impact based on simulated BPT amount
  const bptAmount = simulationQuery.data?.bptOut
    ? Number(simulationQuery.data.bptOut) / 1e18 // Convert from wei to human amount
    : 0

  const depositImpactQuery = useReliquaryDepositImpact(bptAmount, createNew ? undefined : relicId)

  const { pool } = usePool()
  const { priceImpactColor, priceImpact, setPriceImpact } = usePriceImpact()
  const { isConnected } = useUserAccount()
  const { startTokenPricePolling } = useTokens()
  const { calculatePotentialYield } = useGetPoolRewards(pool)
  const { toCurrency } = useCurrency()

  const setFlexibleTab = () => {
    setTabIndex(0)
    setWantsProportional(false)
  }
  const setProportionalTab = () => {
    setTabIndex(1)
    setWantsProportional(true)
  }

  useEffect(() => {
    setPriceImpact(priceImpactQuery.data)
  }, [priceImpactQuery.data])

  const hasPriceImpact = priceImpact !== undefined && priceImpact !== null
  const priceImpactLabel = hasPriceImpact ? fNum('priceImpact', priceImpact) : '-'

  const nestedAddLiquidityEnabled = supportsNestedActions(pool)

  const isLoading = simulationQuery.isLoading || priceImpactQuery.isLoading
  const isFetching = simulationQuery.isFetching || priceImpactQuery.isFetching

  const onModalOpen = async () => {
    previewModalDisclosure.onOpen()
    if (requiresProportionalInput(pool)) {
      await refetchQuote()
    }
  }

  function onModalClose() {
    startTokenPricePolling()
    previewModalDisclosure.onClose()
  }

  useEffect(() => {
    if (addLiquidityTxHash) {
      previewModalDisclosure.onOpen()
    }
  }, [addLiquidityTxHash])

  return (
    <Box maxW="lg" mx="auto" pb="2xl" w="full">
      <Card>
        <CardHeader>
          <HStack justify="space-between" w="full">
            <span>Deposit into Relic</span>
            <TransactionSettings size="xs" />
          </HStack>
        </CardHeader>
        <VStack align="start" spacing="md" w="full">
          {!relicId && (
            <BalAlert content="A new Relic will be created with this deposit" status="info" />
          )}

          {relicId && <BalAlert content={`Depositing into Relic #${relicId}`} status="info" />}

          <AddLiquidityFormTabs
            nestedAddLiquidityEnabled={nestedAddLiquidityEnabled}
            setFlexibleTab={setFlexibleTab}
            setProportionalTab={setProportionalTab}
            tabIndex={tabIndex}
            totalUSDValue={totalUSDValue}
          />

          <ReliquaryDepositImpactWarning
            createNew={createNew}
            depositImpactQuery={depositImpactQuery}
            simulationQuery={simulationQuery}
          />

          <VStack align="start" spacing="sm" w="full">
            {!simulationQuery.isError && (
              <PriceImpactAccordion
                accordionButtonComponent={
                  <HStack gap="xs">
                    <Text color="font.secondary" fontSize="sm" variant="secondary">
                      {wantsProportional ? 'Max slippage:' : 'Potential losses:'}
                    </Text>
                    {isFetching ? (
                      <Skeleton h="16px" w="40px" />
                    ) : (
                      <Text color={priceImpactColor} fontSize="sm" variant="secondary">
                        {wantsProportional ? fNum('slippage', slippage) : priceImpactLabel}
                      </Text>
                    )}
                  </HStack>
                }
                accordionPanelComponent={
                  <PoolActionsPriceImpactDetails
                    bptAmount={simulationQuery.data?.bptOut.amount}
                    isAddLiquidity
                    isLoading={isFetching}
                    slippage={slippage}
                    totalUSDValue={totalUSDValue}
                  />
                }
                action="add"
                cannotCalculatePriceImpact={cannotCalculatePriceImpactError(priceImpactQuery.error)}
                isDisabled={!wantsProportional && !priceImpactQuery.data}
                setNeedsToAcceptPIRisk={setNeedsToAcceptHighPI}
              />
            )}
          </VStack>

          <Grid gap="sm" templateColumns="1fr 1fr" w="full">
            <GridItem>
              <Card minHeight="full" p={['sm', 'ms']} variant="subSection" w="full">
                <VStack align="start" gap="sm">
                  <Text fontSize="sm" fontWeight="500" lineHeight="16px">
                    Total
                  </Text>
                  <Text fontSize="md" fontWeight="700" lineHeight="16px">
                    {formatFalsyValueAsDash(totalUSDValue, toCurrency, {
                      showZeroAmountAsDash: true,
                    })}
                  </Text>
                </VStack>
              </Card>
            </GridItem>
            <GridItem>
              <AddLiquidityPotentialWeeklyYield
                totalUsdValue={totalUSDValue}
                weeklyYield={calculatePotentialYield(totalUSDValue)}
              />
            </GridItem>
          </Grid>

          {showAcceptPoolRisks && <AddLiquidityFormCheckbox />}

          {isConnected ? (
            <Tooltip label={isDisabled ? disabledReason : ''}>
              <Button
                isDisabled={isDisabled}
                isLoading={isLoading}
                onClick={() => !isDisabled && onModalOpen()}
                ref={nextBtn}
                size="lg"
                variant="secondary"
                w="full"
              >
                Next
              </Button>
            </Tooltip>
          ) : (
            <ConnectWallet size="lg" variant="primary" w="full" />
          )}
        </VStack>
      </Card>
      <ReliquaryDepositModal
        createNew={createNew}
        finalFocusRef={nextBtn}
        isOpen={previewModalDisclosure.isOpen}
        onClose={onModalClose}
        onOpen={previewModalDisclosure.onOpen}
        relicId={relicId}
      />
    </Box>
  )
}
