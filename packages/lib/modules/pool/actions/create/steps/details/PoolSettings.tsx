import { VStack, Heading, Text } from '@chakra-ui/react'
import { zeroAddress, Address, isAddress } from 'viem'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolSettingsRadioGroup } from './PoolSettingsRadioGroup'
import { LiquidityManagement } from './LiquidityManagement'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { AMPLIFICATION_PARAMETER_OPTIONS } from '../../constants'
import { getSwapFeePercentageOptions } from '../../helpers'
import { PoolType } from '@balancer/sdk'
import { validatePoolSettings } from '../../validatePoolCreationForm'
import { usePoolHooksWhitelist } from './usePoolHooksWhitelist'
import { useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { reClammPoolAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { getChainId } from '@repo/lib/config/app.config'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isStablePool, isStableSurgePool } from '../../helpers'

export type PoolSettingsOption = {
  label: string
  value: string | undefined
  detail?: React.ReactNode
}

export function PoolSettings() {
  const { userAddress } = useUserAccount()
  const { poolCreationForm } = usePoolCreationForm()
  const [network, poolType] = poolCreationForm.watch(['network', 'poolType'])
  const { poolHooksWhitelist } = usePoolHooksWhitelist(network)

  const filteredPoolHooksOptions = poolHooksWhitelist.filter(
    hook => hook.label !== 'StableSurge' || poolType !== PoolType.GyroE
  )

  const poolManagerOptions: PoolSettingsOption[] = [
    { label: `Delegate to the ${PROJECT_CONFIG.projectName} DAO`, value: zeroAddress },
    {
      label: 'My connected wallet:',
      value: userAddress,
      detail: <BlockExplorerLink address={userAddress} chain={network} fontSize="md" />,
    },
  ]

  const swapFeePercentageOptions: PoolSettingsOption[] = [
    ...getSwapFeePercentageOptions(poolType).map(option => ({
      label: `${option.value}%`,
      value: option.value,
      detail: <Text color="font.secondary">{option.tip}</Text>,
    })),
  ]

  const poolHooksOptions: PoolSettingsOption[] = [
    { label: 'No hooks', value: zeroAddress },
    ...(filteredPoolHooksOptions || []),
  ]

  const amplificationParameterOptions: PoolSettingsOption[] = AMPLIFICATION_PARAMETER_OPTIONS.map(
    value => ({ label: value, value })
  )

  useEffect(() => {
    if (isStableSurgePool(poolType) && poolHooksWhitelist) {
      const stableSurgeHookMetadata = poolHooksWhitelist.find(hook => hook.label === 'StableSurge')
      if (stableSurgeHookMetadata) {
        poolCreationForm.setValue('poolHooksContract', stableSurgeHookMetadata.value)
      }
    }
  }, [poolType, poolHooksWhitelist])

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

      {isStablePool(poolType) && (
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
        isDisabled={isStableSurgePool(poolType)}
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
