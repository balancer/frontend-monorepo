import { VStack, Heading, Text } from '@chakra-ui/react'
import { zeroAddress, Address, isAddress } from 'viem'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
// eslint-disable-next-line no-restricted-imports
import { useAccount } from 'wagmi'
import { PoolSettingsRadioGroup } from './PoolSettingsRadioGroup'
import { LiquidityManagement } from './LiquidityManagement'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { SWAP_FEE_PERCENTAGE_OPTIONS, AMPLIFICATION_PARAMETER_OPTIONS } from '../../constants'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { validatePoolSettings, validatePoolType } from '../../validatePoolCreationForm'
import { usePoolHooksWhitelist } from './usePoolHooksWhitelist'
import { useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { reClammPoolAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { getChainId } from '@repo/lib/config/app.config'

export type PoolSettingsOption = {
  label: string
  value: string | undefined
  detail?: React.ReactNode
}

export function PoolSettings() {
  const { address } = useAccount()
  const { network, poolType, poolCreationForm } = usePoolCreationForm()
  const { poolHooksWhitelist } = usePoolHooksWhitelist(network)

  const poolManagerOptions: PoolSettingsOption[] = [
    { label: 'Delegate to the balancer DAO', value: zeroAddress },
    {
      label: 'My connected wallet:',
      value: address,
      detail: <ConnectedWalletLink address={address} network={network} />,
    },
  ]

  const swapFeePercentageOptions: PoolSettingsOption[] = [
    ...SWAP_FEE_PERCENTAGE_OPTIONS[poolType].map(option => ({
      label: `${option.value}%`,
      value: option.value,
      detail: <Text color="font.secondary">{option.tip}</Text>,
    })),
  ]

  const poolHooksOptions: PoolSettingsOption[] = [
    { label: 'No hooks', value: zeroAddress },
    ...(poolHooksWhitelist || []),
  ]

  const amplificationParameterOptions: PoolSettingsOption[] = AMPLIFICATION_PARAMETER_OPTIONS.map(
    value => ({ label: value, value })
  )

  const isStablePool = validatePoolType.isStablePool(poolType)
  const isStableSurgePool = validatePoolType.isStableSurgePool(poolType)

  useEffect(() => {
    if (isStableSurgePool && poolHooksWhitelist) {
      const stableSurgeHookMetadata = poolHooksWhitelist.find(hook => hook.label === 'StableSurge')
      if (stableSurgeHookMetadata) {
        poolCreationForm.setValue('poolHooksContract', stableSurgeHookMetadata.value)
      }
    }
  }, [isStableSurgePool, poolHooksWhitelist])

  const publicClient = usePublicClient({ chainId: getChainId(network) })

  const validateHooksContract = async (address: string) => {
    if (address === '') return false
    if (address === zeroAddress) return true
    if (!isAddress(address)) return 'Invalid address format'

    try {
      if (!publicClient) return 'missing public client for hooks validation'
      const hookFlags = await publicClient.readContract({
        address: address as Address,
        abi: reClammPoolAbi,
        functionName: 'getHookFlags',
        args: [],
      })
      if (!hookFlags) return 'Invalid hooks contract address'
      return true
    } catch (error) {
      if (error && typeof error === 'object' && 'shortMessage' in error) {
        return (error as any).shortMessage
      }
      console.error(error)
      return 'Unexpected error validating hooks contract address'
    }
  }

  return (
    <VStack align="start" spacing="lg" w="full">
      <Heading color="font.maxContrast" size="md">
        Pool settings
      </Heading>

      <PoolSettingsRadioGroup
        customInputLabel="Custom swap fee manager address"
        customInputType="address"
        name="swapFeeManager"
        options={poolManagerOptions}
        title="Swap fee manager"
        tooltip="TODO"
        validate={validatePoolSettings.swapFeeManager}
      />

      <PoolSettingsRadioGroup
        customInputLabel="Custom pause manager address"
        customInputType="address"
        name="pauseManager"
        options={poolManagerOptions}
        title="Pause manager"
        tooltip="TODO"
        validate={validatePoolSettings.pauseManager}
      />

      <PoolSettingsRadioGroup
        customInputLabel="Custom swap fee"
        customInputType="number"
        isPercentage={true}
        name="swapFeePercentage"
        options={swapFeePercentageOptions}
        title="Swap fee percentage"
        tooltip="TODO"
        validate={value => validatePoolSettings.swapFeePercentage(value, poolType)}
      />

      {isStablePool && (
        <PoolSettingsRadioGroup
          customInputLabel="Custom amplification parameter"
          customInputType="number"
          name="amplificationParameter"
          options={amplificationParameterOptions}
          title="Amplification parameter"
          tooltip="TODO"
          validate={validatePoolSettings.amplificationParameter}
        />
      )}

      <PoolSettingsRadioGroup
        customInputLabel="Custom pool hooks address"
        customInputType="address"
        isDisabled={isStableSurgePool}
        name="poolHooksContract"
        options={poolHooksOptions}
        title="Pool hooks"
        tooltip="TODO"
        validateAsync={validateHooksContract}
      />

      <LiquidityManagement />
    </VStack>
  )
}

interface ConnectedWalletLinkProps {
  address: Address | undefined
  network: GqlChain
}

function ConnectedWalletLink({ address, network }: ConnectedWalletLinkProps) {
  if (!address) return <Text>None</Text>
  return <BlockExplorerLink address={address} chain={network} fontSize="md" />
}
