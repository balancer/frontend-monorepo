'use client'

import {
  Box,
  Button,
  Card,
  HStack,
  HoverCard,
  Skeleton,
  Text,
  VStack,
  Separator,
} from '@chakra-ui/react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { PoolActionsLayout } from '@repo/lib/modules/pool/actions/PoolActionsLayout'
import { PoolActionsPriceImpactDetails } from '@repo/lib/modules/pool/actions/PoolActionsPriceImpactDetails'
import { useRemoveLiquidity } from '@repo/lib/modules/pool/actions/remove-liquidity/RemoveLiquidityProvider'
import { RemoveLiquidityProportional } from '@repo/lib/modules/pool/actions/remove-liquidity/form/RemoveLiquidityProportional'
import { RemoveLiquiditySingleToken } from '@repo/lib/modules/pool/actions/remove-liquidity/form/RemoveLiquiditySingleToken'
import { PriceImpactAccordion } from '@repo/lib/modules/price-impact/PriceImpactAccordion'
import { usePriceImpact } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { TokenBalancesProvider } from '@repo/lib/modules/tokens/TokenBalancesProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { TransactionSettings } from '@repo/lib/modules/user/settings/TransactionSettings'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import ButtonGroup, {
  ButtonGroupOption,
} from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { InputWithSlider } from '@repo/lib/shared/components/inputs/InputWithSlider/InputWithSlider'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { useEffect, useRef, useState } from 'react'
import { ReliquaryRemoveLiquidityModal } from '../components/ReliquaryRemoveLiquidityModal'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'

export function ReliquaryRemoveLiquidityPage({ relicId }: { relicId: string }) {
  const { validTokens } = useRemoveLiquidity()

  return (
    <PriceImpactProvider>
      <PoolActionsLayout redirectPath={`/mabeets${relicId ? `?focusRelic=${relicId}` : ''}`}>
        <TokenBalancesProvider extTokens={validTokens}>
          <ReliquaryRemoveLiquidityForm relicId={relicId} />
        </TokenBalancesProvider>
      </PoolActionsLayout>
    </PriceImpactProvider>
  )
}

function ReliquaryRemoveLiquidityForm({ relicId }: { relicId: string }) {
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

  const [activeTab, setActiveTab] = useState(TABS[0])
  const isProportionalTabSelected = activeTab.value === 'proportional'
  const nextBtn = useRef(null)

  const {
    totalUSDValue,
    priceImpactQuery,
    previewModalDisclosure,
    isDisabled,
    disabledReason,
    simulationQuery,
    removeLiquidityTxHash,
    setProportionalType,
    setSingleTokenType,
    setNeedsToAcceptHighPI,
    tokens,
    humanBptInPercent,
    setHumanBptInPercent,
    isSingleTokenBalanceMoreThat25Percent,
  } = useRemoveLiquidity()

  const { pool, chain } = usePool()
  const { priceImpactColor, priceImpact, setPriceImpact } = usePriceImpact()
  const { startTokenPricePolling } = useTokens()
  const { slippage } = useUserSettings()

  useEffect(() => {
    setPriceImpact(priceImpactQuery.data)
  }, [priceImpactQuery.data])

  const hasPriceImpact = priceImpact !== undefined && priceImpact !== null
  const priceImpactLabel = hasPriceImpact ? fNum('priceImpact', priceImpact) : '-'

  const isFetching = simulationQuery.isFetching || priceImpactQuery.isFetching
  const isLoading = simulationQuery.isLoading || priceImpactQuery.isLoading

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
    startTokenPricePolling()
    previewModalDisclosure.onClose()
  }

  useEffect(() => {
    if (removeLiquidityTxHash) {
      previewModalDisclosure.onOpen()
    }
  }, [removeLiquidityTxHash])

  return (
    <Box maxW="lg" mx="auto" pb="2xl" w="full">
      <Card.Root>
        <Card.Header>
          <HStack justify="space-between" w="full">
            <Box as="span">Remove liquidity from Relic</Box>
            <TransactionSettings size="xs" />
          </HStack>
        </Card.Header>
        <VStack align="start" gap="md" w="full">
          {relicId && (
            <BalAlert content={`Removing liquidity from Relic #${relicId}`} status="info" />
          )}
          <HStack w="full">
            <ButtonGroup
              currentOption={activeTab}
              fontSize="md"
              groupId="remove-type"
              minWidth="116px"
              onChange={toggleTab}
              options={TABS}
              size="sm"
            />
            <HoverCard.Root>
              <HoverCard.Trigger asChild>
                <Box
                  _hover={{ opacity: 1 }}
                  opacity="0.6"
                  transition="opacity 0.2s var(--ease-out-cubic)"
                >
                  <InfoIcon />
                </Box>
              </HoverCard.Trigger>
              <HoverCard.Positioner>
                <HoverCard.Content maxW="300px" p="sm" w="auto">
                  <VStack align="start" gap="sm">
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" mb="xxs">
                        Proportional Removal
                      </Text>
                      <Text fontSize="sm" variant="secondary">
                        Proportional liquidity removal keeps token prices unchanged, ensuring zero
                        price impact to maximize your returns.
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" mb="xxs">
                        Single token Removal
                      </Text>
                      <Text fontSize="sm" variant="secondary">
                        Single-token removal can be convenient but may lower your returns due to
                        price impact.
                      </Text>
                    </Box>
                  </VStack>
                </HoverCard.Content>
              </HoverCard.Positioner>
            </HoverCard.Root>
            <Separator w="full" />
          </HStack>
          <InputWithSlider
            isNumberInputDisabled
            isWarning={isSingleTokenBalanceMoreThat25Percent}
            onPercentChanged={setHumanBptInPercent}
            value={totalUSDValue}
          >
            <Text fontSize="sm" fontWeight="bold">
              Amount
            </Text>
            <Text fontSize="sm" variant="secondary">
              {fNum('percentage', humanBptInPercent / 100)}
            </Text>
          </InputWithSlider>
          {isProportionalTabSelected ? (
            <RemoveLiquidityProportional pool={pool} tokens={tokens} />
          ) : (
            <RemoveLiquiditySingleToken chain={chain} tokens={tokens} />
          )}
          <VStack align="start" gap="sm" w="full">
            {!simulationQuery.isError && (
              <PriceImpactAccordion
                accordionButtonComponent={
                  <HStack gap="xs">
                    <Text color="font.secondary" fontSize="sm" variant="secondary">
                      {isProportionalTabSelected ? 'Max slippage:' : 'Potential losses:'}
                    </Text>
                    {isFetching ? (
                      <Skeleton h="16px" w="40px" />
                    ) : (
                      <Text color={priceImpactColor} fontSize="sm" variant="secondary">
                        {isProportionalTabSelected ? fNum('slippage', slippage) : priceImpactLabel}
                      </Text>
                    )}
                  </HStack>
                }
                accordionPanelComponent={
                  <PoolActionsPriceImpactDetails
                    bptAmount={undefined}
                    loading={isFetching}
                    slippage={slippage}
                    totalUSDValue={totalUSDValue}
                  />
                }
                action="remove"
                disabled={!isProportionalTabSelected && !priceImpactQuery.data}
                setNeedsToAcceptPIRisk={setNeedsToAcceptHighPI}
              />
            )}
          </VStack>
          <Button
            disabled={isDisabled}
            loading={isLoading}
            onClick={() => !isDisabled && previewModalDisclosure.onOpen()}
            ref={nextBtn}
            size="lg"
            variant="secondary"
            w="full"
          >
            {disabledReason || 'Next'}
          </Button>
        </VStack>
      </Card.Root>
      <ReliquaryRemoveLiquidityModal
        finalFocusRef={nextBtn}
        isOpen={previewModalDisclosure.open}
        onClose={onModalClose}
        onOpen={previewModalDisclosure.onOpen}
        relicId={relicId}
      />
    </Box>
  )
}
