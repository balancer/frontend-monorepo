import { Card, CardHeader, CardBody, Heading, VStack, HStack, Text, Box } from '@chakra-ui/react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { zeroAddress } from 'viem'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { validatePoolType } from '../validatePoolCreationForm'

export function PreviewPoolDetails({ isBeforeStep }: { isBeforeStep: boolean }) {
  const {
    network,
    name,
    symbol,
    swapFeePercentage,
    swapFeeManager,
    pauseManager,
    amplificationParameter,
    poolHooksContract,
    disableUnbalancedLiquidity,
    enableDonation,
    poolType,
  } = usePoolCreationForm()

  const isStablePool = validatePoolType.isStablePool(poolType)

  function formatPoolManager(manager: string) {
    if (manager === zeroAddress) return 'Balancer DAO'
    return <BlockExplorerLink address={manager as `0x${string}`} chain={network} fontSize="md" />
  }

  function formatPoolHook(hook: string) {
    if (hook === zeroAddress) return 'None'
    return <BlockExplorerLink address={hook as `0x${string}`} chain={network} fontSize="md" />
  }

  const poolDetailsMap = {
    'Pool name': name,
    'Pool symbol': symbol,
    'Swap fee manager': formatPoolManager(swapFeeManager),
    'Pool pause manager': formatPoolManager(pauseManager),
    'Swap fee percentage': `${swapFeePercentage}%`,
    ...(isStablePool && { 'Amplification parameter': amplificationParameter }),
    'Pool hook': formatPoolHook(poolHooksContract),
    'Allow flexible adds/removes': disableUnbalancedLiquidity ? 'No' : 'Yes',
    'Allow donations': enableDonation ? 'Yes' : 'No',
  }

  return (
    <Card opacity={isBeforeStep ? 0.5 : 1}>
      <CardHeader>
        <Heading size="md">Details</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing="md">
          {Object.entries(poolDetailsMap).map(([label, value]) => (
            <HStack align="start" justify="space-between" key={label} spacing="lg" w="full">
              <Text color="font.secondary">{label}</Text>
              <Box color="font.secondary">{isBeforeStep ? '—' : value}</Box>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  )
}
