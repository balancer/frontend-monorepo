/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { InputWithSlider } from '@repo/lib/shared/components/inputs/InputWithSlider/InputWithSlider'
import { fNum } from '@repo/lib/shared/utils/numbers'
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
import { TransactionSettings } from '@repo/lib/modules/user/settings/TransactionSettings'
import { requiresProportionalInput } from '../../LiquidityActionHelpers'
import { PriceImpactAccordion } from '@repo/lib/modules/price-impact/PriceImpactAccordion'
import { PoolActionsPriceImpactDetails } from '../../PoolActionsPriceImpactDetails'
import { usePriceImpact } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { parseUnits } from 'viem'
import { RemoveSimulationError } from '@repo/lib/shared/components/errors/RemoveSimulationError'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { SafeAppAlert } from '@repo/lib/shared/components/alerts/SafeAppAlert'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { isBoosted } from '../../../pool.helpers'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

export function RemoveLiquidityForm() {
  const { pool } = usePool()
  const { shouldUseSignatures } = useUserSettings()

  const TABS: ButtonGroupOption[] = [
    {
      value: 'proportional',
      label: 'Proportional',
    },
    {
      value: 'single',
      label: 'Single token',
      tabTooltipLabel: isBoosted(pool)
        ? 'Boosted pools do not support single token removes'
        : undefined,
      disabled: isBoosted(pool),
    },
  ] as const
  const [activeTab, setActiveTab] = useState(TABS[0])
  const isProportionalTabSelected = activeTab.value === 'proportional'
  const isSingleTabSelected = activeTab.value === 'single'

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
  const { priceImpactColor, priceImpact, setPriceImpact } = usePriceImpact()
  const { redirectToPoolPage } = usePoolRedirect(pool)
  const nextBtn = useRef(null)
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

  function setProportionalTab() {
    toggleTab(TABS[0])
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
      <Box h="full" maxW="lg" mx="auto" pb="2xl" w="full">
        <Card>
          <CardHeader>
            <HStack justify="space-between" w="full">
              <span>Remove liquidity</span>
              <TransactionSettings size="sm" />
            </HStack>
          </CardHeader>
          <VStack align="start" spacing="md">
            <SafeAppAlert />
            {!shouldUseSignatures && (
              <BalAlert
                content="All approvals will require gas transactions. You can enable signatures in your settings."
                status="warning"
                title="Signatures disabled"
              />
            )}
            {!requiresProportionalInput(pool) && (
              <HStack>
                <ButtonGroup
                  currentOption={activeTab}
                  groupId="remove"
                  onChange={toggleTab}
                  options={TABS}
                  size="xxs"
                />
                <Popover trigger="hover">
                  <PopoverTrigger>
                    <Box
                      _hover={{ opacity: 1 }}
                      opacity="0.5"
                      transition="opacity 0.2s var(--ease-out-cubic)"
                    >
                      <InfoIcon />
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent maxW="300px" p="sm" w="auto">
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
            <VStack align="start" spacing="md" w="full">
              <InputWithSlider
                isNumberInputDisabled
                isWarning={isWarning}
                onPercentChanged={setHumanBptInPercent}
                value={totalUSDValue}
              >
                <Text fontSize="sm">Amount</Text>
                <Text fontSize="sm" variant="secondary">
                  {fNum('percentage', humanBptInPercent / 100)}
                </Text>
              </InputWithSlider>
              {isWarning && (
                <Text color="font.warning" fontSize="xs">
                  You can only remove up to 25% of a single asset from the pool in one transaction
                </Text>
              )}
              {isProportionalTabSelected && (
                <RemoveLiquidityProportional pool={pool} tokens={tokens} />
              )}
              {isSingleTabSelected && (
                <RemoveLiquiditySingleToken chain={pool.chain} tokens={tokens} />
              )}
            </VStack>
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
                      bptAmount={BigInt(parseUnits(quoteBptIn, 18))}
                      isLoading={isFetching}
                      slippage={slippage}
                      totalUSDValue={totalUSDValue}
                    />
                  }
                  isDisabled={priceImpactQuery.isLoading && !priceImpactQuery.isSuccess}
                  setNeedsToAcceptPIRisk={setNeedsToAcceptHighPI}
                />
              )}
            </VStack>
            <RemoveSimulationError
              goToProportionalRemoves={setProportionalTab}
              priceImpactQuery={priceImpactQuery}
              simulationQuery={simulationQuery}
            />
            <TooltipWithTouch label={isDisabled ? disabledReason : ''}>
              <Button
                isDisabled={isDisabled || isWarning}
                isLoading={simulationQuery.isLoading || priceImpactQuery.isLoading}
                onClick={() => !isDisabled && previewModalDisclosure.onOpen()}
                ref={nextBtn}
                size="lg"
                variant="secondary"
                w="full"
              >
                Next
              </Button>
            </TooltipWithTouch>
          </VStack>
        </Card>
        <RemoveLiquidityModal
          finalFocusRef={nextBtn}
          isOpen={previewModalDisclosure.isOpen}
          onClose={onModalClose}
          onOpen={previewModalDisclosure.onOpen}
        />
      </Box>
    </TokenBalancesProvider>
  )
}
