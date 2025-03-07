/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import {
  TokenBalancesProvider,
  useTokenBalances,
} from '@repo/lib/modules/tokens/TokenBalancesProvider'
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
import { useEffect, useRef, useState } from 'react'
import { AddLiquidityModal } from '../modal/AddLiquidityModal'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import {
  ProportionalTransactionSettings,
  TransactionSettings,
} from '@repo/lib/modules/user/settings/TransactionSettings'
import { usePool } from '../../../PoolProvider'
import {
  hasNoLiquidity,
  requiresProportionalInput,
  supportsNestedActions,
} from '../../LiquidityActionHelpers'
import { PriceImpactAccordion } from '@repo/lib/modules/price-impact/PriceImpactAccordion'
import { PoolActionsPriceImpactDetails } from '../../PoolActionsPriceImpactDetails'
import { usePriceImpact } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { AddLiquidityFormCheckbox } from './AddLiquidityFormCheckbox'
import { GenericError } from '@repo/lib/shared/components/errors/GenericError'
import { PriceImpactError } from '../../../../price-impact/PriceImpactError'
import { AddLiquidityPotentialWeeklyYield } from '@repo/lib/modules/pool/actions/add-liquidity/form/AddLiquidityPotentialWeeklyYield'
import { cannotCalculatePriceImpactError } from '@repo/lib/modules/price-impact/price-impact.utils'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { SafeAppAlert } from '@repo/lib/shared/components/alerts/SafeAppAlert'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { AddLiquidityFormTabs } from './AddLiquidityFormTabs'
import { UnbalancedAddError } from '@repo/lib/shared/components/errors/UnbalancedAddError'
import { isUnbalancedAddError } from '@repo/lib/shared/utils/error-filters'
import { supportsWethIsEth } from '../../../pool.helpers'
import { UnbalancedNestedAddError } from '@repo/lib/shared/components/errors/UnbalancedNestedAddError'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useGetPoolRewards } from '../../../useGetPoolRewards'

// small wrapper to prevent out of context error
export function AddLiquidityForm() {
  const { validTokens, slippage, wantsProportional } = useAddLiquidity()

  const bufferPercentage = wantsProportional ? slippage : '0'

  return (
    <TokenBalancesProvider bufferPercentage={bufferPercentage} extTokens={validTokens}>
      <AddLiquidityMainForm />
    </TokenBalancesProvider>
  )
}

function AddLiquidityMainForm() {
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
    setWethIsEth,
    nativeAsset,
    wNativeAsset,
    previewModalDisclosure,
    slippage,
    setProportionalSlippage,
    setWantsProportional,
    wantsProportional,
  } = useAddLiquidity()

  const { pool } = usePool()
  const { priceImpactColor, priceImpact, setPriceImpact } = usePriceImpact()
  const { toCurrency } = useCurrency()
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const { isConnected } = useUserAccount()
  const { startTokenPricePolling } = useTokens()
  const { shouldUseSignatures } = useUserSettings()
  const { calculatePotentialYield } = useGetPoolRewards(pool)

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

  const nestedAddLiquidityEnabled = supportsNestedActions(pool) // TODO && !userToggledEscapeHatch

  const isUnbalancedError = isUnbalancedAddError(simulationQuery.error || priceImpactQuery.error)

  const shouldShowUnbalancedError = isUnbalancedError && !nestedAddLiquidityEnabled

  const isLoading = simulationQuery.isLoading || priceImpactQuery.isLoading
  const isFetching = simulationQuery.isFetching || priceImpactQuery.isFetching

  const onModalOpen = async () => {
    previewModalDisclosure.onOpen()
    if (requiresProportionalInput(pool)) {
      // Edge-case refetch to avoid mismatches in proportional bptOut calculations
      await refetchQuote()
    }
  }

  // if native asset balance is higher set that asset as the 'default'
  useEffect(() => {
    if (!isBalancesLoading && nativeAsset && wNativeAsset && supportsWethIsEth(pool)) {
      const nativeAssetBalance = balanceFor(nativeAsset.address)
      const wNativeAssetBalance = balanceFor(wNativeAsset.address)
      if (
        nativeAssetBalance &&
        wNativeAssetBalance &&
        bn(nativeAssetBalance.amount).gt(bn(wNativeAssetBalance.amount))
      ) {
        setWethIsEth(true)
      }
    }
  }, [isBalancesLoading])

  function onModalClose() {
    // restart polling for token prices when modal is closed again
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
            <span>Add liquidity</span>
            {wantsProportional ? (
              <ProportionalTransactionSettings
                pool={pool}
                setSlippage={setProportionalSlippage}
                size="sm"
                slippage={slippage}
              />
            ) : (
              <TransactionSettings size="sm" />
            )}
          </HStack>
        </CardHeader>
        <VStack align="start" spacing="md" w="full">
          {hasNoLiquidity(pool) && (
            <BalAlert content="You cannot add because the pool has no liquidity" status="warning" />
          )}
          {!shouldUseSignatures && (
            <BalAlert
              content="All approvals will require gas transactions. You can enable signatures in your settings."
              status="warning"
              title="Signatures disabled"
            />
          )}
          <SafeAppAlert />
          <AddLiquidityFormTabs
            nestedAddLiquidityEnabled={nestedAddLiquidityEnabled}
            setFlexibleTab={setFlexibleTab}
            setProportionalTab={setProportionalTab}
            tabIndex={tabIndex}
            totalUSDValue={totalUSDValue}
          />
          {!wantsProportional && shouldShowUnbalancedError && (
            <UnbalancedAddError
              error={(simulationQuery.error || priceImpactQuery.error) as Error}
              goToProportionalAdds={setProportionalTab}
              isProportionalSupported={!nestedAddLiquidityEnabled}
            />
          )}
          <VStack align="start" spacing="sm" w="full">
            {!simulationQuery.isError && (
              <PriceImpactAccordion
                accordionButtonComponent={
                  <HStack>
                    <Text color="font.secondary" fontSize="sm" variant="secondary">
                      Price impact:{' '}
                    </Text>
                    {isFetching ? (
                      <Skeleton h="16px" w="40px" />
                    ) : (
                      <Text color={priceImpactColor} fontSize="sm" variant="secondary">
                        {priceImpactLabel}
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
                avoidPriceImpactAlert={shouldShowUnbalancedError}
                cannotCalculatePriceImpact={cannotCalculatePriceImpactError(priceImpactQuery.error)}
                isDisabled={!priceImpactQuery.data}
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
                    {totalUSDValue !== '0'
                      ? toCurrency(totalUSDValue, { abbreviated: false })
                      : '-'}
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
          {!simulationQuery.isError && priceImpactQuery.isError && (
            <PriceImpactError priceImpactQuery={priceImpactQuery} />
          )}
          {simulationQuery.isError && nestedAddLiquidityEnabled && (
            <UnbalancedNestedAddError error={simulationQuery.error} />
          )}
          {simulationQuery.isError && !nestedAddLiquidityEnabled && (
            <GenericError
              customErrorName="Error in query simulation"
              error={simulationQuery.error}
              skipError={shouldShowUnbalancedError}
            />
          )}

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
      <AddLiquidityModal
        finalFocusRef={nextBtn}
        isOpen={previewModalDisclosure.isOpen}
        onClose={onModalClose}
        onOpen={previewModalDisclosure.onOpen}
      />
    </Box>
  )
}
