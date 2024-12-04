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
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { Address } from 'viem'
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
import { isNativeOrWrappedNative, isNativeAsset } from '@repo/lib/modules/tokens/token.helpers'
import { GqlToken } from '@repo/lib/shared/services/api/generated/graphql'
import { NativeAssetSelectModal } from '@repo/lib/modules/tokens/NativeAssetSelectModal'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { GenericError } from '@repo/lib/shared/components/errors/GenericError'
import { PriceImpactError } from '../../../../price-impact/PriceImpactError'
import AddLiquidityAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/AddLiquidityAprTooltip'
import { calcPotentialYieldFor } from '../../../pool.utils'
import { cannotCalculatePriceImpactError } from '@repo/lib/modules/price-impact/price-impact.utils'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@repo/lib/modules/web3/ConnectWallet'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { SafeAppAlert } from '@repo/lib/shared/components/alerts/SafeAppAlert'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { AddLiquidityFormTabs } from './AddLiquidityFormTabs'
import { UnbalancedAddError } from '@repo/lib/shared/components/errors/UnbalancedAddError'
import { isUnbalancedAddError } from '@repo/lib/shared/utils/error-filters'
import { isV3NotSupportingWethIsEth } from '../../../pool.helpers'

// small wrapper to prevent out of context error
export function AddLiquidityForm() {
  const { validTokens, proportionalSlippage } = useAddLiquidity()

  return (
    <TokenBalancesProvider bufferPercentage={proportionalSlippage} extTokens={validTokens}>
      <AddLiquidityMainForm />
    </TokenBalancesProvider>
  )
}

function AddLiquidityMainForm() {
  const {
    setHumanAmountIn: setAmountIn,
    validTokens,
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
    proportionalSlippage,
    slippage,
    setProportionalSlippage,
    setWantsProportional,
    wantsProportional,
  } = useAddLiquidity()

  const nextBtn = useRef(null)
  const { pool } = usePool()
  const { priceImpactColor, priceImpact, setPriceImpact } = usePriceImpact()
  const { toCurrency } = useCurrency()
  const tokenSelectDisclosure = useDisclosure()
  const { setValidationError } = useTokenInputsValidation()
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const { isConnected } = useUserAccount()
  const { startTokenPricePolling } = useTokens()
  const [tabIndex, setTabIndex] = useState(0)

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

  const weeklyYield = calcPotentialYieldFor(pool, totalUSDValue)

  const isLoading = simulationQuery.isLoading || priceImpactQuery.isLoading
  const isFetching = simulationQuery.isFetching || priceImpactQuery.isFetching

  const onModalOpen = async () => {
    previewModalDisclosure.onOpen()
    if (requiresProportionalInput(pool)) {
      // Edge-case refetch to avoid mismatches in proportional bptOut calculations
      await refetchQuote()
    }
  }

  const nativeAssets = validTokens.filter(token =>
    isNativeOrWrappedNative(token.address as Address, token.chain)
  )

  // if native asset balance is higher set that asset as the 'default'
  useEffect(() => {
    if (!isBalancesLoading && nativeAsset && wNativeAsset && !isV3NotSupportingWethIsEth(pool)) {
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

  function handleTokenSelect(token: GqlToken) {
    if (isNativeAsset(token.address as Address, token.chain)) {
      setWethIsEth(true)
    } else {
      setWethIsEth(false)
    }
    setAmountIn(token.address as Address, '')

    // reset any validation errors for native assets
    nativeAssets.forEach(nativeAsset => {
      setValidationError(nativeAsset.address as Address, '')
    })
  }

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
            {requiresProportionalInput(pool) || wantsProportional ? (
              <ProportionalTransactionSettings
                setSlippage={setProportionalSlippage}
                size="sm"
                slippage={proportionalSlippage}
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
          <SafeAppAlert />
          <AddLiquidityFormTabs
            nestedAddLiquidityEnabled={nestedAddLiquidityEnabled}
            setFlexibleTab={setFlexibleTab}
            setProportionalTab={setProportionalTab}
            tabIndex={tabIndex}
            tokenSelectDisclosure={tokenSelectDisclosure}
            totalUSDValue={totalUSDValue}
          />
          {!wantsProportional && isUnbalancedError && (
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
                avoidPriceImpactAlert={isUnbalancedError && !nestedAddLiquidityEnabled}
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
              <AddLiquidityAprTooltip
                aprItems={pool.dynamicData.aprItems}
                pool={pool}
                totalUsdValue={totalUSDValue}
                weeklyYield={weeklyYield}
              />
            </GridItem>
          </Grid>
          {showAcceptPoolRisks && <AddLiquidityFormCheckbox />}
          {!simulationQuery.isError && priceImpactQuery.isError && (
            <PriceImpactError priceImpactQuery={priceImpactQuery} />
          )}
          {simulationQuery.isError && (
            <GenericError
              customErrorName="Error in query simulation"
              error={simulationQuery.error}
              skipError={isUnbalancedError}
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
      {!!validTokens.length && (
        <NativeAssetSelectModal
          chain={validTokens[0].chain}
          isOpen={tokenSelectDisclosure.isOpen}
          nativeAssets={nativeAssets}
          onClose={tokenSelectDisclosure.onClose}
          onOpen={tokenSelectDisclosure.onOpen}
          onTokenSelect={handleTokenSelect}
        />
      )}
    </Box>
  )
}
