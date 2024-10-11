/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { TokenBalancesProvider } from '@/lib/modules/tokens/TokenBalancesProvider'
import ButtonGroup, {
  ButtonGroupOption,
} from '@/lib/shared/components/btns/button-group/ButtonGroup'
import { InputWithSlider } from '@/lib/shared/components/inputs/InputWithSlider/InputWithSlider'
import { fNum } from '@/lib/shared/utils/numbers'
import {
  Box,
  Button,
  Card,
  CardHeader,
  HStack,
  Skeleton,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  VStack,
} from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { RemoveLiquidityModal } from '../modal/RemoveLiquidityModal'
import { useRemoveLiquidity } from '../RemoveLiquidityProvider'
import { RemoveLiquidityProportional } from './RemoveLiquidityProportional'
import { RemoveLiquiditySingleToken } from './RemoveLiquiditySingleToken'
import { usePool } from '../../../PoolProvider'
import { usePoolRedirect } from '../../../pool.hooks'
import { TransactionSettings } from '@/lib/modules/user/settings/TransactionSettings'
import { requiresProportionalInput } from '../../LiquidityActionHelpers'
import { PriceImpactAccordion } from '@/lib/modules/price-impact/PriceImpactAccordion'
import { PoolActionsPriceImpactDetails } from '../../PoolActionsPriceImpactDetails'
import { usePriceImpact } from '@/lib/modules/price-impact/PriceImpactProvider'
import { parseUnits } from 'viem'
import { SimulationError } from '@/lib/shared/components/errors/SimulationError'
import { InfoIcon } from '@/lib/shared/components/icons/InfoIcon'
import { SafeAppAlert } from '@/lib/shared/components/alerts/SafeAppAlert'
import { useTokens } from '@/lib/modules/tokens/TokensProvider'
import { TooltipWithTouch } from '@/lib/shared/components/tooltips/TooltipWithTouch'
import { useUserSettings } from '@/lib/modules/user/settings/UserSettingsProvider'

const TABS: ButtonGroupOption[] = [
  {
    value: 'proportional',
    label: 'Proportional',
  },
  {
    value: 'single',
    label: 'Single token',
  },
] as const

export function RemoveLiquidityForm() {
  const {
    transactionSteps,
    tokens,
    validTokens,
    humanBptInPercent,
    totalUSDValue,
    priceImpactQuery,
    previewModalDisclosure,
    isDisabled,
    disabledReason,
    simulationQuery,
    quoteBptIn,
    removeLiquidityTxHash,
    isSingleTokenBalanceMoreThat25Percent,
    isSingleToken,
    setProportionalType,
    setSingleTokenType,
    setHumanBptInPercent,
    setNeedsToAcceptHighPI,
  } = useRemoveLiquidity()
  const { pool } = usePool()
  const { priceImpactColor, priceImpact, setPriceImpact } = usePriceImpact()
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const nextBtn = useRef(null)
  const [activeTab, setActiveTab] = useState(TABS[0])
  const { startTokenPricePolling } = useTokens()
  const { slippage } = useUserSettings()

  useEffect(() => {
    setPriceImpact(priceImpactQuery.data)
  }, [priceImpactQuery.data])

  const hasPriceImpact = priceImpact !== undefined && priceImpact !== null
  const priceImpactLabel = hasPriceImpact ? fNum('priceImpact', priceImpact) : '-' // If it's 0 we want to display 0.

  const isFetching = simulationQuery.isFetching || priceImpactQuery.isFetching

  function toggleTab(option: ButtonGroupOption) {
    setActiveTab(option)
    if (option.value === 'proportional') {
      setProportionalType()
    }
    if (option.value === 'single') {
      setSingleTokenType()
    }
  }

  const onModalClose = () => {
    // restart polling for token prices when modal is closed again
    startTokenPricePolling()

    if (transactionSteps.lastTransactionConfirmingOrConfirmed) {
      // If the transaction is confirming or confirmed, it's very likely that
      // they no longer have a pool balance. To be safe, always redirect to the
      // pool page when closing the modal in this state.
      redirectToPoolPage()
    } else {
      previewModalDisclosure.onClose()
    }
  }

  useEffect(() => {
    if (removeLiquidityTxHash) {
      previewModalDisclosure.onOpen()
    }
  }, [removeLiquidityTxHash])

  const isWarning = isSingleToken && isSingleTokenBalanceMoreThat25Percent

  return (
    <TokenBalancesProvider extTokens={validTokens}>
      <Box h="full" w="full" maxW="lg" mx="auto" pb="2xl">
        <Card>
          <CardHeader>
            <HStack justify="space-between" w="full">
              <span>Remove liquidity</span>
              <TransactionSettings size="sm" />
            </HStack>
          </CardHeader>
          <VStack spacing="md" align="start">
            <SafeAppAlert />
            {!requiresProportionalInput(pool) && (
              <HStack>
                <ButtonGroup
                  currentOption={activeTab}
                  options={TABS}
                  onChange={toggleTab}
                  size="xxs"
                  groupId="remove"
                />
                <Popover trigger="hover">
                  <PopoverTrigger>
                    <Box
                      opacity="0.5"
                      transition="opacity 0.2s var(--ease-out-cubic)"
                      _hover={{ opacity: 1 }}
                    >
                      <InfoIcon />
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent p="sm" w="auto" maxW="300px">
                    <Text fontSize="sm" variant="secondary">
                      Proportional liquidity removal does not impact the prices of tokens on exit,
                      which maximizes your returns. Alternatively, Single-token removal may be more
                      convenient in certain situations but may reduce the value returned to you due
                      to price impact.
                    </Text>
                  </PopoverContent>
                </Popover>
              </HStack>
            )}
            <VStack w="full" spacing="md" align="start">
              <InputWithSlider
                value={totalUSDValue}
                onPercentChanged={setHumanBptInPercent}
                isNumberInputDisabled
                isWarning={isWarning}
              >
                <Text fontSize="sm">Amount</Text>
                <Text fontSize="sm" variant="secondary">
                  {fNum('percentage', humanBptInPercent / 100)}
                </Text>
              </InputWithSlider>
              {isWarning && (
                <Text fontSize="xs" color="font.warning">
                  You can only remove up to 25% of a single asset from the pool in one transaction
                </Text>
              )}
              {activeTab === TABS[0] && (
                <RemoveLiquidityProportional tokens={tokens} poolType={pool.type} />
              )}
              {activeTab === TABS[1] && (
                <RemoveLiquiditySingleToken tokens={tokens} chain={pool.chain} />
              )}
            </VStack>
            <VStack spacing="sm" align="start" w="full">
              {!simulationQuery.isError && (
                <PriceImpactAccordion
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
                      bptAmount={BigInt(parseUnits(quoteBptIn, 18))}
                      slippage={slippage}
                      isLoading={isFetching}
                    />
                  }
                  isDisabled={priceImpactQuery.isLoading && !priceImpactQuery.isSuccess}
                />
              )}
            </VStack>
            <SimulationError simulationQuery={simulationQuery} />
            <TooltipWithTouch label={isDisabled ? disabledReason : ''}>
              <Button
                ref={nextBtn}
                variant="secondary"
                w="full"
                size="lg"
                isDisabled={isDisabled || isWarning}
                isLoading={simulationQuery.isLoading || priceImpactQuery.isLoading}
                onClick={() => !isDisabled && previewModalDisclosure.onOpen()}
              >
                Next
              </Button>
            </TooltipWithTouch>
          </VStack>
        </Card>
        <RemoveLiquidityModal
          finalFocusRef={nextBtn}
          isOpen={previewModalDisclosure.isOpen}
          onOpen={previewModalDisclosure.onOpen}
          onClose={onModalClose}
        />
      </Box>
    </TokenBalancesProvider>
  )
}
