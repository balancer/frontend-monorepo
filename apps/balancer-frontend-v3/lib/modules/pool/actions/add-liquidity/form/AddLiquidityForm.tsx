/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { TokenBalancesProvider, useTokenBalances } from '@/lib/modules/tokens/TokenBalancesProvider'
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
import { bn, fNum } from '@/lib/shared/utils/numbers'
import { TransactionSettings } from '@/lib/modules/user/settings/TransactionSettings'
import { TokenInputs } from './TokenInputs'
import { TokenInputsWithAddable } from './TokenInputsWithAddable'
import { usePool } from '../../../PoolProvider'
import {
  hasNoLiquidity,
  requiresProportionalInput,
  supportsNestedActions,
} from '../../LiquidityActionHelpers'
import { PriceImpactAccordion } from '@/lib/modules/price-impact/PriceImpactAccordion'
import { PoolActionsPriceImpactDetails } from '../../PoolActionsPriceImpactDetails'
import { usePriceImpact } from '@/lib/modules/price-impact/PriceImpactProvider'
import { useCurrency } from '@/lib/shared/hooks/useCurrency'
import { AddLiquidityFormCheckbox } from './AddLiquidityFormCheckbox'
import { isNativeOrWrappedNative, isNativeAsset } from '@/lib/modules/tokens/token.helpers'
import { GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { NativeAssetSelectModal } from '@/lib/modules/tokens/NativeAssetSelectModal'
import { useTokenInputsValidation } from '@/lib/modules/tokens/TokenInputsValidationProvider'
import { GenericError } from '@/lib/shared/components/errors/GenericError'
import { PriceImpactError } from '../../../../price-impact/PriceImpactError'
import AddLiquidityAprTooltip from '@/lib/shared/components/tooltips/apr-tooltip/AddLiquidityAprTooltip'
import { calcPotentialYieldFor } from '../../../pool.utils'
import { cannotCalculatePriceImpactError } from '@/lib/modules/price-impact/price-impact.utils'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { ConnectWallet } from '@/lib/modules/web3/ConnectWallet'
import { BalAlert } from '@/lib/shared/components/alerts/BalAlert'
import { SafeAppAlert } from '@/lib/shared/components/alerts/SafeAppAlert'

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
    isNativeOrWrappedNative(token.address as Address, token.chain)
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
    <Box maxW="lg" mx="auto" pb="2xl" w="full">
      <Card>
        <CardHeader>
          <HStack justify="space-between" w="full">
            <span>Add liquidity</span>
            <TransactionSettings size="sm" />
          </HStack>
        </CardHeader>
        <VStack align="start" spacing="md" w="full">
          {hasNoLiquidity(pool) && (
            <BalAlert content="You cannot add because the pool has no liquidity" status="warning" />
          )}
          <SafeAppAlert />
          {!nestedAddLiquidityEnabled ? (
            <TokenInputsWithAddable
              requiresProportionalInput={requiresProportionalInput(pool.type)}
              tokenSelectDisclosureOpen={() => tokenSelectDisclosure.onOpen()}
              totalUSDValue={totalUSDValue}
            />
          ) : (
            <TokenInputs tokenSelectDisclosureOpen={() => tokenSelectDisclosure.onOpen()} />
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
                    totalUSDValue={totalUSDValue}
                  />
                }
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
          {showAcceptPoolRisks ? <AddLiquidityFormCheckbox /> : null}
          {!simulationQuery.isError && priceImpactQuery.isError ? (
            <PriceImpactError priceImpactQuery={priceImpactQuery} />
          ) : null}
          {simulationQuery.isError ? (
            <GenericError
              customErrorName="Error in query simulation"
              error={simulationQuery.error}
            />
          ) : null}
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
        onClose={previewModalDisclosure.onClose}
        onOpen={previewModalDisclosure.onOpen}
      />
      {validTokens.length > 0 && (
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
