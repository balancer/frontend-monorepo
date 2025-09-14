import { Heading, VStack, Text, HStack, Card, SimpleGrid } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { BalPopover } from '@repo/lib/shared/components/popover/BalPopover'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { useReClammConfigurationOptions } from './useReClammConfigurationOptions'
import { PoolCreationCheckbox } from '../../PoolCreationCheckbox'

export function ReClammConfiguration() {
  const { poolCreationForm } = usePoolCreationForm()
  const { poolTokens } = poolCreationForm.watch()
  const { targetPrices, targetPriceBoundaries, marginBuffers, dailyPriceReadjustmentRates } =
    useReClammConfigurationOptions()

  const tokenSymbolsString = poolTokens.map(token => token.data?.symbol).join(' / ')

  return (
    <VStack align="start" spacing="xl" w="full">
      <Heading color="font.maxContrast" size="md">
        ReClamm configuration
      </Heading>
      <ConfigOptionsGroup label={`Target price: ${tokenSymbolsString}`} options={targetPrices} />
      <ConfigOptionsGroup
        label={`Target concentration density of liquidity`}
        options={targetPriceBoundaries}
      />
      <ConfigOptionsGroup label={`Margin buffer`} options={marginBuffers} />
      <ConfigOptionsGroup
        label={`Daily price re-adjustment rate, when out-of-range`}
        options={dailyPriceReadjustmentRates}
      />
    </VStack>
  )
}

interface ConfigOptionsGroupProps {
  label: string
  options: { label: string; displayValue: string; preciseValue: string }[]
}

function ConfigOptionsGroup({ label, options }: ConfigOptionsGroupProps) {
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
        {options.map(option => (
          <Card h={32} key={option.label}>
            <VStack h="full" justify="center">
              <Text color="font.secondary" fontSize="sm">
                {option.label}
              </Text>
              <Text color="font.secondary">{option.displayValue}</Text>
            </VStack>
          </Card>
        ))}
      </SimpleGrid>
      <PoolCreationCheckbox isChecked={false} label="Or choose custom" onChange={() => {}} />
    </VStack>
  )
}
