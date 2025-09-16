import {
  Card,
  CardHeader,
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
  const { reClammConfigForm } = usePoolCreationForm()
  const {
    initialTargetPrice,
    initialMinPrice,
    initialMaxPrice,
    priceShiftDailyRate,
    // centerednessMargin,
  } = reClammConfigForm.watch()

  const reClammConfigCards = [
    {
      label: 'Min Price',
      value: bn(initialMinPrice).toFixed(2),
    },
    {
      label: 'Lower Target',
      value: '???',
    },
    {
      label: 'Current Price',
      value: bn(initialTargetPrice).toFixed(2),
    },
    {
      label: 'Upper Target',
      value: '???',
    },
    {
      label: 'Max Price',
      value: bn(initialMaxPrice).toFixed(2),
    },
  ]
  return (
    <Card>
      <VStack>
        <CardHeader>
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
        </CardHeader>
      </VStack>

      <CardBody>
        <VStack spacing="lg">
          <Divider />
          <Divider />
          <HStack justify="space-between" w="full">
            <Button flexDirection="row" gap="2" size="sm" variant="tertiary">
              <HStack>
                <RefreshCcw size={12} />
                <Text color="font.secondary" fontSize="sm">
                  wstETH/USDC
                </Text>
              </HStack>
            </Button>
            <Box bg="background.special" borderRadius="md" opacity={0.25} p={2.5}>
              <Text color="font.dark" fontSize="xs">
                Concentration density: {priceShiftDailyRate}%
              </Text>
            </Box>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}
