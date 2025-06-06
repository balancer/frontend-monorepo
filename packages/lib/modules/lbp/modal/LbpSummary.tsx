import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { Card, VStack, Text, Divider, HStack } from '@chakra-ui/react'
import { useLbpForm } from '../LbpFormProvider'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { Address } from 'viem'
import { formatDateTimeShort } from '@repo/lib/shared/utils/time'
import { ArrowRight } from 'react-feather'
import { ReactNode } from 'react'

export function LbpSummary() {
  const { saleStructureForm, saleMarketCap } = useLbpForm()
  const {
    collateralTokenAddress,
    collateralTokenAmount,
    launchTokenAddress,
    saleTokenAmount,
    selectedChain,
    startTime,
    endTime,
    weightAdjustmentType,
    userActions,
  } = saleStructureForm.getValues()

  return (
    <AnimateHeightChange spacing="sm" w="full">
      {/* {isMobile && <MobileStepTracker chain={selectedChain} transactionSteps={transactionSteps} />} */}

      <Card variant="modalSubSection">
        <VStack align="start">
          <Text>Sale Token</Text>
          <TokenRow
            address={launchTokenAddress as Address}
            chain={selectedChain}
            value={saleTokenAmount}
          />
          <Divider p="0" />
          <Text>Collateral Token</Text>
          <TokenRow
            address={collateralTokenAddress as Address}
            chain={selectedChain}
            value={collateralTokenAmount}
          />
        </VStack>
      </Card>
      <Card variant="modalSubSection">
        <VStack align="start">
          <Text>Sale details</Text>
          <HStack justify="space-between" w="full">
            <Text color="grayText">Sale start</Text>
            <Text color="grayText">{formatDateTimeShort(new Date(startTime))}</Text>
          </HStack>
          <HStack justify="space-between" w="full">
            <Text color="grayText">Sale end</Text>
            <Text color="grayText">{formatDateTimeShort(new Date(endTime))}</Text>
          </HStack>
          <HStack justify="space-between" w="full">
            <Text color="grayText">Dynamic weight shifts</Text>
            {humanWeightShifts[weightAdjustmentType]}
          </HStack>
          <HStack justify="space-between" w="full">
            <Text color="grayText">Sale Type</Text>
            <Text color="grayText">{humanUserActions[userActions]}</Text>
          </HStack>
          <HStack justify="space-between" w="full">
            <Text color="grayText">Sale Market Cap Range</Text>
            <Text color="grayText">{saleMarketCap}</Text>
          </HStack>
        </VStack>
      </Card>
    </AnimateHeightChange>
  )
}

const humanWeightShifts: Record<string, ReactNode> = {
  linear_90_10: (
    <HStack spacing={1}>
      <Text color="grayText">Standard linear: 90</Text>
      <ArrowRight color="grayText" size={16} />
      <Text color="grayText">10</Text>
    </HStack>
  ),
  linear_90_50: (
    <HStack spacing={1}>
      <Text color="grayText">Standard linear: 90</Text>
      <ArrowRight color="grayText" size={16} />
      <Text color="grayText">50</Text>
    </HStack>
  ),
  custom: 'Custom',
}

const humanUserActions: Record<string, ReactNode> = {
  buy_only: 'Users can Buy Only',
  buy_and_sell: 'Users can Buy & Sell',
}
