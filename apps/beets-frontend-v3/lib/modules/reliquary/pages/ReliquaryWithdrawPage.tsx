'use client'

import { Box, Button, Card, CardHeader, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
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
import { ReliquaryWithdrawModal } from '../components/ReliquaryWithdrawModal'

export function ReliquaryWithdrawPage({ relicId }: { relicId: string }) {
  const { validTokens } = useRemoveLiquidity()

  return (
    <PoolActionsLayout redirectPath={`/mabeets${relicId ? `?focusRelic=${relicId}` : ''}`}>
      <TokenBalancesProvider extTokens={validTokens}>
        <ReliquaryWithdrawForm relicId={relicId} />
      </TokenBalancesProvider>
    </PoolActionsLayout>
  )
}

function ReliquaryWithdrawForm({ relicId }: { relicId: string }) {
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
      <Card>
        <CardHeader>
          <HStack justify="space-between" w="full">
            <Box as="span">Withdraw from Relic</Box>
            <TransactionSettings size="xs" />
          </HStack>
        </CardHeader>
        <VStack align="start" spacing="md" w="full">
          {relicId && <BalAlert content={`Withdrawing from Relic #${relicId}`} status="info" />}

          <ButtonGroup
            currentOption={activeTab}
            groupId="remove-type"
            onChange={toggleTab}
            options={TABS}
            size="md"
          />

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

          <VStack align="start" spacing="sm" w="full">
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
                    isLoading={isFetching}
                    slippage={slippage}
                    totalUSDValue={totalUSDValue}
                  />
                }
                action="remove"
                isDisabled={!isProportionalTabSelected && !priceImpactQuery.data}
                setNeedsToAcceptPIRisk={setNeedsToAcceptHighPI}
              />
            )}
          </VStack>

          <Button
            isDisabled={isDisabled}
            isLoading={isLoading}
            onClick={() => !isDisabled && previewModalDisclosure.onOpen()}
            ref={nextBtn}
            size="lg"
            variant="secondary"
            w="full"
          >
            {disabledReason || 'Next'}
          </Button>
        </VStack>
      </Card>
      <ReliquaryWithdrawModal
        finalFocusRef={nextBtn}
        isOpen={previewModalDisclosure.isOpen}
        onClose={onModalClose}
        onOpen={previewModalDisclosure.onOpen}
        relicId={relicId}
      />
    </Box>
  )
}
