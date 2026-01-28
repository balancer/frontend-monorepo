import { CardHeader, CardBody, Heading, VStack, HStack, Text } from '@chakra-ui/react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { zeroAddress } from 'viem'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { usePoolHooksWhitelist } from '../steps/details/usePoolHooksWhitelist'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { PreviewPoolCreationCard } from './PreviewPoolCreationCard'
import { isStablePool, isCowPool, isPoolCreatorEnabled } from '../helpers'
import { useWatch } from 'react-hook-form'

export function PreviewPoolDetails() {
  return (
    <PreviewPoolCreationCard stepTitle="Details">
      <CardHeader>
        <Heading size="md">Details</Heading>
      </CardHeader>
      <CardBody>
        <VStack spacing="0">
          <PoolDetailsContent />
        </VStack>
      </CardBody>
    </PreviewPoolCreationCard>
  )
}

export function PoolDetailsContent() {
  const { poolCreationForm, isBeforeStep } = usePoolCreationForm()
  const [
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
    poolCreator,
  ] = useWatch({
    control: poolCreationForm.control,
    name: [
      'network',
      'name',
      'symbol',
      'swapFeePercentage',
      'swapFeeManager',
      'pauseManager',
      'amplificationParameter',
      'poolHooksContract',
      'disableUnbalancedLiquidity',
      'enableDonation',
      'poolType',
      'poolCreator',
    ],
  })

  const { poolHooksWhitelist } = usePoolHooksWhitelist(network)

  function formatPoolManager(manager: string) {
    if (manager === zeroAddress) return `${PROJECT_CONFIG.projectName} DAO`
    return <BlockExplorerLink address={manager as `0x${string}`} chain={network} fontSize="md" />
  }

  function formatPoolHook(hook: string) {
    if (hook === zeroAddress) return 'None'
    const hookMetadata = poolHooksWhitelist.find(h => h.value.toLowerCase() === hook.toLowerCase())

    return (
      <BlockExplorerLink
        address={hook as `0x${string}`}
        chain={network}
        customLabel={hookMetadata?.label}
        fontSize="md"
      />
    )
  }

  const showPoolSettings = !isCowPool(poolType)
  const showAmplificationParameter = isStablePool(poolType)

  const poolDetailsMap = {
    'Pool name': name,
    'Pool symbol': symbol,
    ...(showPoolSettings && {
      ...(isPoolCreatorEnabled(poolType) && { 'Pool creator': formatPoolManager(poolCreator) }),
      'Swap fee manager': formatPoolManager(swapFeeManager),
      'Pool pause manager': formatPoolManager(pauseManager),
      'Swap fee percentage': `${swapFeePercentage}%`,
      ...(showAmplificationParameter && { 'Amplification parameter': amplificationParameter }),
      'Pool hook': formatPoolHook(poolHooksContract),
      'Allow flexible adds/removes': disableUnbalancedLiquidity ? 'No' : 'Yes',
      'Allow donations': enableDonation ? 'Yes' : 'No',
    }),
  }

  return Object.entries(poolDetailsMap).map(([label, value]) => (
    <HStack
      _hover={{ bg: 'background.level0' }}
      align="start"
      justify="space-between"
      key={label}
      mx="-md"
      px="md"
      py="sm"
      sx={{
        '&:hover p': { color: 'font.maxContrast' },
      }}
      transition="1s all var(--ease-out-cubic)"
      w="calc(100% + var(--chakra-space-md) * 2)"
    >
      <Text color="font.secondary">{label}</Text>
      <Text as="span" color="font.secondary">
        {isBeforeStep('Details') ? '—' : value}
      </Text>
    </HStack>
  ))
}
