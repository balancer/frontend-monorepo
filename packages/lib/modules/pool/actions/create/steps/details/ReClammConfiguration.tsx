import { Heading, VStack, Text, HStack, Card, SimpleGrid } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { BalPopover } from '@repo/lib/shared/components/popover/BalPopover'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { useReClammConfigurationOptions } from './useReClammConfigurationOptions'
import { PoolCreationCheckbox } from '../../PoolCreationCheckbox'

export function ReClammConfiguration() {
  const { poolCreationForm, reClammConfigForm } = usePoolCreationForm()
  const { poolTokens } = poolCreationForm.watch()
  const { initialTargetPrice, targetPriceBoundarySpread, centerednessMargin, priceShiftDailyRate } =
    reClammConfigForm.watch()
  const { targetPrice, targetPriceBoundary, marginBuffer, dailyPriceReadjustmentRate } =
    useReClammConfigurationOptions()

  const tokenSymbolsString = poolTokens.map(token => token.data?.symbol).join(' / ')

  return (
    <VStack align="start" spacing="xl" w="full">
      <Heading color="font.maxContrast" size="md">
        ReClamm configuration
      </Heading>
      <ConfigOptionsGroup
        label={`Target price: ${tokenSymbolsString}`}
        options={targetPrice.options}
        selectedOption={initialTargetPrice}
        updateFn={targetPrice.updateFn}
      />
      <ConfigOptionsGroup
        label={`Target concentration density of liquidity`}
        options={targetPriceBoundary.options}
        selectedOption={targetPriceBoundarySpread}
        updateFn={targetPriceBoundary.updateFn}
      />
      <ConfigOptionsGroup
        label={`Margin buffer`}
        options={marginBuffer.options}
        selectedOption={centerednessMargin}
        updateFn={marginBuffer.updateFn}
      />
      <ConfigOptionsGroup
        label={`Daily price re-adjustment rate, when out-of-range`}
        options={dailyPriceReadjustmentRate.options}
        selectedOption={priceShiftDailyRate}
        updateFn={dailyPriceReadjustmentRate.updateFn}
      />
    </VStack>
  )
}

interface ConfigOptionsGroupProps {
  label: string
  options: { label: string; displayValue: string; rawValue: string }[]
  selectedOption: string
  updateFn: (rawValue: string) => void
}

function ConfigOptionsGroup({ label, options, selectedOption, updateFn }: ConfigOptionsGroupProps) {
  return (
    <VStack align="start" spacing="md" w="full">
      <HStack>
        <Text textAlign="start" w="full">
          {label}
        </Text>
        <BalPopover text="TODO">
          <InfoIcon />
        </BalPopover>
      </HStack>
      <SimpleGrid columns={3} spacing="md" w="full">
        {options.map(option => {
          const isSelected = selectedOption === option.rawValue
          const bg = isSelected ? '#63F2BE0D' : 'background.level2'
          const borderColor = isSelected ? '#25E2A4' : 'transparent'
          const shadow = isSelected ? 'none' : 'lg'
          const textColor = isSelected ? 'font.maxContrast' : 'font.secondary'

          return (
            <Card
              _hover={{ cursor: 'pointer', shadow: 'md' }}
              bg={bg}
              borderColor={borderColor}
              h={28}
              key={option.label}
              onClick={() => updateFn(option.rawValue)}
              shadow={shadow}
            >
              <VStack h="full" justify="center">
                <Text color={textColor} fontSize="sm">
                  {option.label}
                </Text>
                <Text color={textColor} fontWeight="bold">
                  {option.displayValue}
                </Text>
              </VStack>
            </Card>
          )
        })}
      </SimpleGrid>
      <PoolCreationCheckbox
        isChecked={false}
        label="Or choose custom"
        labelColor="font.secondary"
        onChange={() => {}}
      />
    </VStack>
  )
}
