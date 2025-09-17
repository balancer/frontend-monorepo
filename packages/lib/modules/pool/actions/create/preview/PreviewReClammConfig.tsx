import {
  Card,
  CardBody,
  SimpleGrid,
  VStack,
  Divider,
  Text,
  HStack,
  Button,
  Box,
} from '@chakra-ui/react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { bn } from '@repo/lib/shared/utils/numbers'
import { RefreshCcw } from 'react-feather'

export function PreviewReClammConfig() {
  const { reClammConfigForm, poolCreationForm } = usePoolCreationForm()
  const {
    initialTargetPrice,
    initialMinPrice,
    initialMaxPrice,
    priceShiftDailyRate,
    // centerednessMargin,
  } = reClammConfigForm.watch()
  const { poolTokens } = poolCreationForm.watch()

  const reClammConfigCards = [
    {
      label: 'Min Price',
      value: initialMinPrice ? bn(initialMinPrice).toFixed(2) : '-',
    },
    {
      label: 'Lower Target',
      value: '-',
    },
    {
      label: 'Current Price',
      value: initialTargetPrice ? bn(initialTargetPrice).toFixed(2) : '-',
    },
    {
      label: 'Upper Target',
      value: '-',
    },
    {
      label: 'Max Price',
      value: initialMaxPrice ? bn(initialMaxPrice).toFixed(2) : '-',
    },
  ]

  const tokenSymbols = poolTokens.map(token => token.data?.symbol).filter(Boolean)
  const tokenSymbolsString = tokenSymbols.join(' / ')
  const showInvertButton = tokenSymbols.length > 0

  return (
    <Card>
      <CardBody>
        <VStack spacing="lg">
          <SimpleGrid columns={5} spacing={3} w="full">
            {reClammConfigCards.map(({ label, value }) => (
              <Card key={label} variant="subSection">
                <Text color="font.secondary" fontSize="sm">
                  {label}
                </Text>
                <Text fontSize="sm" fontWeight="bold">
                  {value}
                </Text>
              </Card>
            ))}
          </SimpleGrid>

          <Divider />

          <Box h={250}></Box>

          {showInvertButton && (
            <>
              <Divider />
              <HStack justify="space-between" w="full">
                <Button flexDirection="row" gap="2" size="sm" variant="tertiary">
                  <HStack>
                    <RefreshCcw size={12} />
                    <Text color="font.secondary" fontSize="sm">
                      {tokenSymbolsString}
                    </Text>
                  </HStack>
                </Button>

                {priceShiftDailyRate && (
                  <Box bg="background.level3" borderRadius="md" p={2.5}>
                    <Text color="font.secondary" fontSize="xs">
                      Concentration density: {priceShiftDailyRate}%
                    </Text>
                  </Box>
                )}
              </HStack>
            </>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
