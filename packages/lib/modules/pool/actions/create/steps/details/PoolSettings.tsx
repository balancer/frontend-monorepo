import { VStack, Heading, Text } from '@chakra-ui/react'
import { zeroAddress, Address, isAddress } from 'viem'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolSettingsRadioGroup } from './PoolSettingsRadioGroup'
import { LiquidityManagement } from './LiquidityManagement'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { AMPLIFICATION_PARAMETER_OPTIONS } from '../../constants'
import { getSwapFeePercentageOptions, isSonicNetwork } from '../../helpers'
import { validatePoolSettings } from '../../validatePoolCreationForm'
import { usePoolHooksWhitelist } from './usePoolHooksWhitelist'
import { useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { reClammPoolAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { getChainId } from '@repo/lib/config/app.config'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isStablePool, isStableSurgePool } from '../../helpers'
import { useWatch } from 'react-hook-form'

export type PoolSettingsOption = {
  label: string
  value: string | undefined
  detail?: React.ReactNode
}

export function PoolSettings() {
  const { userAddress } = useUserAccount()
  const { poolCreationForm } = usePoolCreationForm()
  const [network, poolType] = useWatch({
    control: poolCreationForm.control,
    name: ['network', 'poolType'],
  })

  const isPoolCreatorAllowed = !isSonicNetwork(network) // contracts yet to be deployed on sonic

  const { poolHooksWhitelist } = usePoolHooksWhitelist(network)

  const filteredPoolHooksOptions = poolHooksWhitelist.filter(hook => {
    if (isStableSurgePool(poolType)) {
      return hook.label === 'StableSurge' // this pool type requires use of stable surge hook
    } else if (!isStablePool(poolType)) {
      return hook.label !== 'StableSurge' // remove stable surge hook from options for non-stable pool types
    } else {
      return true
    }
  })

  const poolRoleAccountOptions: PoolSettingsOption[] = [
    { label: `Delegate to the ${PROJECT_CONFIG.projectName} DAO`, value: zeroAddress },
    {
      label: 'My connected wallet:',
      value: userAddress,
      detail: <BlockExplorerLink address={userAddress} chain={network} />,
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

  const showAmplificationParameter = isStablePool(poolType)
  const showPoolHooks = !isStableSurgePool(poolType)

  return (
    <VStack align="start" spacing="lg" w="full">
      <Heading color="font.maxContrast" size="md">
        Pool settings
      </Heading>

      {isPoolCreatorAllowed && (
        <PoolSettingsRadioGroup
          customInputLabel="Custom pool creator address"
          customInputType="address"
          name="poolCreator"
          options={poolRoleAccountOptions}
          title="Pool Creator"
          tooltip="Account empowered to set a pool creator fee (or 0 if all fees go to the protocol and LPs)"
          validate={validatePoolSettings.poolRoleAccount}
        />
      )}

      <PoolSettingsRadioGroup
        customInputLabel="Custom swap fee manager address"
        customInputType="address"
        name="swapFeeManager"
        options={poolRoleAccountOptions}
        title="Swap fee manager"
        tooltip="Account empowered to set static swap fees for a pool"
        validate={validatePoolSettings.poolRoleAccount}
      />

      <PoolSettingsRadioGroup
        customInputLabel="Custom pause manager address"
        customInputType="address"
        name="pauseManager"
        options={poolRoleAccountOptions}
        title="Pause manager"
        tooltip="Account empowered to pause/unpause the pool (note that governance can always pause a pool)"
        validate={validatePoolSettings.poolRoleAccount}
      />

      <PoolSettingsRadioGroup
        customInputLabel="Custom swap fee"
        customInputType="number"
        isPercentage={true}
        name="swapFeePercentage"
        options={swapFeePercentageOptions}
        title="Swap fee percentage"
        tooltip="The initial static swap fee percentage of the pool"
        validate={value => validatePoolSettings.swapFeePercentage(value, poolType)}
      />

      {showAmplificationParameter && (
        <PoolSettingsRadioGroup
          customInputLabel="Custom amplification parameter"
          customInputType="number"
          name="amplificationParameter"
          options={amplificationParameterOptions}
          title="Amplification parameter"
          tooltip='Controls the "flatness" of the invariant curve. Higher values = lower slippage and assumes prices are near parity. Lower values = closer to the constant product curve (e.g., more like a weighted pool). This has higher slippage and accommodates greater price volatility.'
          validate={validatePoolSettings.amplificationParameter}
        />
      )}

      {showPoolHooks && (
        <PoolSettingsRadioGroup
          customInputLabel="Custom pool hooks address"
          customInputType="address"
          isDisabled={isStableSurgePool(poolType)}
          name="poolHooksContract"
          options={poolHooksOptions}
          title="Pool hooks"
          tooltip="Contract that implements the hooks for the pool"
          validateAsync={validateHooksContract}
        />
      )}
      <LiquidityManagement />
    </VStack>
  )
}
