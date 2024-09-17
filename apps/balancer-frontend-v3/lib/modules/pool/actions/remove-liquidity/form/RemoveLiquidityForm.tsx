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
  Tooltip,
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
            {!requiresProportionalInput(pool.type) && (
              <HStack>
                <ButtonGroup
                  currentOption={activeTab}
                  groupId="remove"
                  onChange={toggleTab}
                  options={TABS}
                  size="xxs"
                />
                <Tooltip fontSize="sm" label="Remove liquidity type">
                  <InfoIcon />
                </Tooltip>
              </HStack>
            )}
            <VStack spacing="md" w="full">
              <InputWithSlider
                isNumberInputDisabled
                onPercentChanged={setHumanBptInPercent}
                value={totalUSDValue}
              >
                <Text fontSize="sm">Amount</Text>
                <Text fontSize="sm" variant="secondary">
                  {fNum('percentage', humanBptInPercent / 100)}
                </Text>
              </InputWithSlider>
              {activeTab === TABS[0] && (
                <RemoveLiquidityProportional poolType={pool.type} tokens={tokens} />
              )}
              {activeTab === TABS[1] && (
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
                      totalUSDValue={totalUSDValue}
                    />
                  }
                  isDisabled={priceImpactQuery.isLoading ? !priceImpactQuery.isSuccess : undefined}
                  setNeedsToAcceptPIRisk={setNeedsToAcceptHighPI}
                />
              )}
            </VStack>
            <SimulationError simulationQuery={simulationQuery} />
            <Tooltip label={isDisabled ? disabledReason : ''}>
              <Button
                isDisabled={isDisabled}
                isLoading={simulationQuery.isLoading || priceImpactQuery.isLoading}
                onClick={() => !isDisabled && previewModalDisclosure.onOpen()}
                ref={nextBtn}
                size="lg"
                variant="secondary"
                w="full"
              >
                Next
              </Button>
            </Tooltip>
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
