import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { Card, VStack, Text, Divider, HStack } from '@chakra-ui/react'
import { useLbpForm } from '../LbpFormProvider'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { Address } from 'viem'
import { formatDateTimeShort } from '@repo/lib/shared/utils/time'
import { ArrowRight } from 'react-feather'
import { ReactNode } from 'react'
import { MobileStepTracker } from '@repo/lib/modules/transactions/transaction-steps/step-tracker/MobileStepTracker'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { TransactionStepsResponse } from '../../transactions/transaction-steps/useTransactionSteps'
import { GasCostSummaryCard } from '@repo/lib/modules/transactions/transaction-steps/GasCostSummaryCard'
import { UserActions, WeightAdjustmentType } from '@repo/lib/modules/lbp/lbp.types'
import { isDynamicSaleType, isFixedSaleType } from '../steps/sale-structure/helpers'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'

export function LbpSummary({ transactionSteps }: { transactionSteps: TransactionStepsResponse }) {
  const { saleStructureForm, saleMarketCap, launchToken, launchTokenPriceFiat } = useLbpForm()
  const { isMobile } = useBreakpoints()
  const { getToken } = useTokens()

  const {
    collateralTokenAddress,
    collateralTokenAmount,
    launchTokenAddress,
    saleTokenAmount,
    selectedChain,
    startDateTime,
    endDateTime,
    weightAdjustmentType,
    userActions,
    saleType,
    launchTokenPrice,
  } = saleStructureForm.getValues()

  const isDynamicSale = isDynamicSaleType(saleType)
  const isFixedSale = isFixedSaleType(saleType)

  const collateralToken = getToken(collateralTokenAddress, selectedChain)

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {isMobile && <MobileStepTracker chain={selectedChain} transactionSteps={transactionSteps} />}

      <Card variant="modalSubSection">
        <VStack align="start" gap="ms">
          <Text fontWeight="bold">Sale token</Text>
          <TokenRow
            address={launchTokenAddress as Address}
            chain={selectedChain}
            customToken={launchToken}
            value={saleTokenAmount}
          />
          <Divider p="0" />
          <Text fontWeight="bold">Collateral token</Text>
          <TokenRow
            address={collateralTokenAddress as Address}
            chain={selectedChain}
            value={collateralTokenAmount}
          />
        </VStack>
      </Card>
      <Card variant="modalSubSection">
        <VStack align="start">
          <Text fontWeight="bold">Sale details</Text>
          <HStack justify="space-between" w="full">
            <Text color="grayText">Sale start</Text>
            <Text color="grayText">{formatDateTimeShort(new Date(startDateTime))}</Text>
          </HStack>
          <HStack justify="space-between" w="full">
            <Text color="grayText">Sale end</Text>
            <Text color="grayText">{formatDateTimeShort(new Date(endDateTime))}</Text>
          </HStack>
          <HStack justify="space-between" w="full">
            <Text color="grayText">Sale Type</Text>
            <Text color="grayText">{humanUserActions[userActions]}</Text>
          </HStack>
          {isDynamicSale && (
            <>
              <HStack justify="space-between" w="full">
                <Text color="grayText">Dynamic weight shifts</Text>
                {humanWeightShifts[weightAdjustmentType]}
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="grayText">Sale Market Cap Range</Text>
                <Text color="grayText">{saleMarketCap}</Text>
              </HStack>
            </>
          )}
          {isFixedSale && (
            <>
              <HStack justify="space-between" w="full">
                <Text color="grayText">{launchToken.symbol} token price</Text>
                <Text color="grayText">
                  {launchTokenPrice} / {collateralToken?.symbol} (~{launchTokenPriceFiat})
                </Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text color="grayText">Collateral token max if sold out</Text>
                <Text color="grayText">
                  {fNum('token', bn(saleTokenAmount).times(launchTokenPrice).toString())}{' '}
                  {collateralToken?.symbol}
                </Text>
              </HStack>
            </>
          )}
        </VStack>
      </Card>
      <GasCostSummaryCard chain={selectedChain} transactionSteps={transactionSteps.steps} />
    </AnimateHeightChange>
  )
}

const humanWeightShifts: Record<WeightAdjustmentType, ReactNode> = {
  [WeightAdjustmentType.LINEAR_90_10]: (
    <HStack spacing={1}>
      <Text color="grayText">Standard linear: 90</Text>
      <ArrowRight color="grayText" size={16} />
      <Text color="grayText">10</Text>
    </HStack>
  ),
  [WeightAdjustmentType.LINEAR_90_50]: (
    <HStack spacing={1}>
      <Text color="grayText">Standard linear: 90</Text>
      <ArrowRight color="grayText" size={16} />
      <Text color="grayText">50</Text>
    </HStack>
  ),
  [WeightAdjustmentType.CUSTOM]: 'Custom',
}

const humanUserActions: Record<UserActions, ReactNode> = {
  [UserActions.BUY_ONLY]: 'Users can ‘Buy’ only',
  [UserActions.BUY_AND_SELL]: 'Users can ‘Buy & Sell’',
}
