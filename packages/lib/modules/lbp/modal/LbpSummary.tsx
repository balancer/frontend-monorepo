import { AnimateHeightChange } from '@repo/lib/shared/components/animations/AnimateHeightChange'
import { Card, VStack, Text, Divider, HStack } from '@chakra-ui/react'
import { useLbpForm } from '../LbpFormProvider'
import TokenRow from '@repo/lib/modules/tokens/TokenRow/TokenRow'
import { Address } from 'viem'
import { formatDateTimeShort } from '@repo/lib/shared/utils/time'

export function LbpSummary() {
  const { saleStructureForm } = useLbpForm()
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
            <Text color="grayText">{weightAdjustmentType}</Text>
          </HStack>
          <HStack justify="space-between" w="full">
            <Text color="grayText">Sale Type</Text>
            <Text color="grayText">{userActions}</Text>
          </HStack>
          <HStack justify="space-between" w="full">
            <Text color="grayText">Sale Market Cap Range</Text>
            <Text color="grayText">???</Text>
          </HStack>
        </VStack>
      </Card>
    </AnimateHeightChange>
  )
}
