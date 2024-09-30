/* eslint-disable react-hooks/exhaustive-deps */
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
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import { Address } from 'viem'
import { AddLiquidityModal } from '../modal/AddLiquidityModal'
import { useAddLiquidity } from '../AddLiquidityProvider'
import { TokenInputs } from './TokenInputs'
import { TokenInputsWithAddable } from './TokenInputsWithAddable'
import { usePool } from '../../../PoolProvider'
import {
  hasNoLiquidity,
  requiresProportionalInput,
  supportsNestedActions,
} from '../../LiquidityActionHelpers'
import { PoolActionsPriceImpactDetails } from '../../PoolActionsPriceImpactDetails'
import { AddLiquidityFormCheckbox } from './AddLiquidityFormCheckbox'
import { PriceImpactError } from '../../../../price-impact/PriceImpactError'
import { calcPotentialYieldFor } from '../../../pool.utils'
import { BalAlert } from '../../../../../shared/components/alerts/BalAlert'
import { SafeAppAlert } from '../../../../../shared/components/alerts/SafeAppAlert'
import { GenericError } from '../../../../../shared/components/errors/GenericError'
import AddLiquidityAprTooltip from '../../../../../shared/components/tooltips/apr-tooltip/AddLiquidityAprTooltip'
import { useCurrency } from '../../../../../shared/hooks/useCurrency'
import { GqlToken } from '../../../../../shared/services/api/generated/graphql'
import { bn, fNum } from '../../../../../shared/utils/numbers'
import { cannotCalculatePriceImpactError } from '../../../../price-impact/price-impact.utils'
import { PriceImpactAccordion } from '../../../../price-impact/PriceImpactAccordion'
import { usePriceImpact } from '../../../../price-impact/PriceImpactProvider'
import { NativeAssetSelectModal } from '../../../../tokens/NativeAssetSelectModal'
import { isNativeOrWrappedNative, isNativeAsset } from '../../../../tokens/token.helpers'
import { TokenBalancesProvider, useTokenBalances } from '../../../../tokens/TokenBalancesProvider'
import { useTokenInputsValidation } from '../../../../tokens/TokenInputsValidationProvider'
import { TransactionSettings } from '../../../../user/settings/TransactionSettings'
import { ConnectWallet } from '../../../../web3/ConnectWallet'
import { useUserAccount } from '../../../../web3/UserAccountProvider'

// small wrapper to prevent out of context error
export function AddLiquidityForm() {
  const { validTokens } = useAddLiquidity()

  return (
    <TokenBalancesProvider extTokens={validTokens}>
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
  } = useAddLiquidity()

  const nextBtn = useRef(null)
  const { pool } = usePool()
  const { priceImpactColor, priceImpact, setPriceImpact } = usePriceImpact()
  const { toCurrency } = useCurrency()
  const tokenSelectDisclosure = useDisclosure()
  const { setValidationError } = useTokenInputsValidation()
  const { balanceFor, isBalancesLoading } = useTokenBalances()
  const { isConnected } = useUserAccount()

  useEffect(() => {
    setPriceImpact(priceImpactQuery.data)
  }, [priceImpactQuery.data])

  const hasPriceImpact = priceImpact !== undefined && priceImpact !== null
  const priceImpactLabel = hasPriceImpact ? fNum('priceImpact', priceImpact) : '-'

  const weeklyYield = calcPotentialYieldFor(pool, totalUSDValue)

  const nestedAddLiquidityEnabled = supportsNestedActions(pool) // TODO && !userToggledEscapeHatch
  const isLoading = simulationQuery.isLoading || priceImpactQuery.isLoading
  const isFetching = simulationQuery.isFetching || priceImpactQuery.isFetching

  const onModalOpen = async () => {
    previewModalDisclosure.onOpen()
    if (requiresProportionalInput(pool.type)) {
      // Edge-case refetch to avoid mismatches in proportional bptOut calculations
      await refetchQuote()
    }
  }

  const nativeAssets = validTokens.filter(token =>
    isNativeOrWrappedNative(token.address as Address, token.chain),
  )

  // if native asset balance is higher set that asset as the 'default'
  useEffect(() => {
    if (!isBalancesLoading && nativeAsset && wNativeAsset) {
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

  useEffect(() => {
    if (addLiquidityTxHash) {
      previewModalDisclosure.onOpen()
    }
  }, [addLiquidityTxHash])

  return (
    <Box w="full" maxW="lg" mx="auto" pb="2xl">
      <Card>
        <CardHeader>
          <HStack w="full" justify="space-between">
            <span>Add liquidity</span>
            <TransactionSettings size="sm" />
          </HStack>
        </CardHeader>
        <VStack spacing="md" align="start" w="full">
          {hasNoLiquidity(pool) && (
            <BalAlert status="warning" content="You cannot add because the pool has no liquidity" />
          )}
          <SafeAppAlert />
          {!nestedAddLiquidityEnabled ? (
            <TokenInputsWithAddable
              tokenSelectDisclosureOpen={() => tokenSelectDisclosure.onOpen()}
              requiresProportionalInput={requiresProportionalInput(pool.type)}
              totalUSDValue={totalUSDValue}
            />
          ) : (
            <TokenInputs tokenSelectDisclosureOpen={() => tokenSelectDisclosure.onOpen()} />
          )}
          <VStack spacing="sm" align="start" w="full">
            {!simulationQuery.isError && (
              <PriceImpactAccordion
                isDisabled={!priceImpactQuery.data}
                cannotCalculatePriceImpact={cannotCalculatePriceImpactError(priceImpactQuery.error)}
                setNeedsToAcceptPIRisk={setNeedsToAcceptHighPI}
                accordionButtonComponent={
                  <HStack>
                    <Text variant="secondary" fontSize="sm" color="font.secondary">
                      Price impact:{' '}
                    </Text>
                    {isFetching ? (
                      <Skeleton w="40px" h="16px" />
                    ) : (
                      <Text variant="secondary" fontSize="sm" color={priceImpactColor}>
                        {priceImpactLabel}
                      </Text>
                    )}
                  </HStack>
                }
                accordionPanelComponent={
                  <PoolActionsPriceImpactDetails
                    totalUSDValue={totalUSDValue}
                    bptAmount={simulationQuery.data?.bptOut.amount}
                    isAddLiquidity
                    isLoading={isFetching}
                  />
                }
              />
            )}
          </VStack>
          <Grid w="full" templateColumns="1fr 1fr" gap="sm">
            <GridItem>
              <Card minHeight="full" variant="subSection" w="full" p={['sm', 'ms']}>
                <VStack align="start" gap="sm">
                  <Text fontSize="sm" lineHeight="16px" fontWeight="500">
                    Total
                  </Text>
                  <Text fontSize="md" lineHeight="16px" fontWeight="700">
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
                totalUsdValue={totalUSDValue}
                weeklyYield={weeklyYield}
                pool={pool}
              />
            </GridItem>
          </Grid>
          {showAcceptPoolRisks && <AddLiquidityFormCheckbox />}
          {!simulationQuery.isError && priceImpactQuery.isError && (
            <PriceImpactError priceImpactQuery={priceImpactQuery} />
          )}
          {simulationQuery.isError && (
            <GenericError
              customErrorName={'Error in query simulation'}
              error={simulationQuery.error}
            ></GenericError>
          )}
          {isConnected ? (
            <Tooltip label={isDisabled ? disabledReason : ''}>
              <Button
                ref={nextBtn}
                variant="secondary"
                w="full"
                size="lg"
                isDisabled={isDisabled}
                isLoading={isLoading}
                onClick={() => !isDisabled && onModalOpen()}
              >
                Next
              </Button>
            </Tooltip>
          ) : (
            <ConnectWallet variant="primary" w="full" size="lg" />
          )}
        </VStack>
      </Card>
      <AddLiquidityModal
        finalFocusRef={nextBtn}
        isOpen={previewModalDisclosure.isOpen}
        onOpen={previewModalDisclosure.onOpen}
        onClose={previewModalDisclosure.onClose}
      />
      {!!validTokens.length && (
        <NativeAssetSelectModal
          chain={validTokens[0].chain}
          isOpen={tokenSelectDisclosure.isOpen}
          onOpen={tokenSelectDisclosure.onOpen}
          onClose={tokenSelectDisclosure.onClose}
          onTokenSelect={handleTokenSelect}
          nativeAssets={nativeAssets}
        />
      )}
    </Box>
  )
}