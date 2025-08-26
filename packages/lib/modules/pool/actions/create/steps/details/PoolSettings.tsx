import { VStack, Heading, Text } from '@chakra-ui/react'
import { zeroAddress, isAddress } from 'viem'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useAccount } from 'wagmi'
import { PoolSettingsRadioGroup } from './PoolSettingsRadioGroup'
import { LiquidityManagement } from './LiquidityManagement'
import { useValidatePoolConfig } from '../../useValidatePoolConfig'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { useValidatePoolHooksContract } from './useValidatePoolHooksContract'
import {
  SWAP_FEE_PERCENTAGE_OPTIONS,
  AMPLIFICATION_PARAMETER_OPTIONS,
  MIN_SWAP_FEE_PERCENTAGE,
  MAX_SWAP_FEE_PERCENTAGE,
  MIN_AMPLIFICATION_PARAMETER,
  MAX_AMPLIFICATION_PARAMETER,
} from '../../constants'
import { Address } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useEffect } from 'react'

export type PoolSettingsOption = {
  label: string
  value: string | undefined
  detail?: React.ReactNode
}

export function PoolSettings() {
  const { address } = useAccount()
  const {
    network,
    poolType,
    poolHooksContract,
    poolConfigForm: { trigger },
  } = usePoolCreationForm()
  const { isStablePool } = useValidatePoolConfig()

  const { isValidPoolHooksContract, isLoadingPoolHooksContract } = useValidatePoolHooksContract(
    poolHooksContract as Address
  )

  const swapFeeManagerOptions: PoolSettingsOption[] = [
    { label: 'Delegate to the balancer DAO', value: zeroAddress },
    {
      label: 'My connected wallet:',
      value: address,
      detail: <ConnectedWalletLink address={address} network={network} />,
    },
  ]

  const pauseManagerOptions: PoolSettingsOption[] = [
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

  const poolHooksOptions: PoolSettingsOption[] = [{ label: 'No hooks', value: zeroAddress }]

  const amplificationParameterOptions: PoolSettingsOption[] = AMPLIFICATION_PARAMETER_OPTIONS.map(
    value => ({ label: value, value })
  )

  useEffect(() => {
    if (isValidPoolHooksContract) trigger('poolHooksContract')
  }, [isValidPoolHooksContract])

  const validatePoolHooksContract = (value: string) => {
    if (value === '') return false
    if (value === zeroAddress) return true
    if (isLoadingPoolHooksContract) return true
    if (value && !isAddress(value)) return 'Invalid address'
    if (value && !isValidPoolHooksContract) return 'Invalid pool hooks contract'
    return true
  }

  const validatePoolManagerAddress = (value: string) => {
    if (!isAddress(value)) return 'Invalid address'
    return true
  }

  const validateSwapFeePercentage = (value: string) => {
    if (
      Number(value) < Number(MIN_SWAP_FEE_PERCENTAGE[poolType]) ||
      Number(value) > Number(MAX_SWAP_FEE_PERCENTAGE)
    )
      return `Value must be between ${MIN_SWAP_FEE_PERCENTAGE[poolType]} and ${MAX_SWAP_FEE_PERCENTAGE}`
    return true
  }

  const validateAmplificationParameter = (value: string) => {
    if (
      Number(value) < Number(MIN_AMPLIFICATION_PARAMETER) ||
      Number(value) > Number(MAX_AMPLIFICATION_PARAMETER)
    )
      return `Value must be between ${MIN_AMPLIFICATION_PARAMETER} and ${MAX_AMPLIFICATION_PARAMETER}`
    return true
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
        options={swapFeeManagerOptions}
        title="Swap fee manager"
        tooltip="TODO"
        validate={value => validatePoolManagerAddress(value)}
      />

      <PoolSettingsRadioGroup
        customInputLabel="Custom pause manager address"
        customInputType="address"
        name="pauseManager"
        options={pauseManagerOptions}
        title="Pause manager"
        tooltip="TODO"
        validate={value => validatePoolManagerAddress(value)}
      />

      <PoolSettingsRadioGroup
        customInputLabel="Custom swap fee"
        customInputType="number"
        isPercentage={true}
        name="swapFeePercentage"
        options={swapFeePercentageOptions}
        title="Swap fee percentage"
        tooltip="TODO"
        validate={value => validateSwapFeePercentage(value)}
      />

      {isStablePool && (
        <PoolSettingsRadioGroup
          customInputLabel="Custom amplification parameter"
          customInputType="number"
          name="amplificationParameter"
          options={amplificationParameterOptions}
          title="Amplification parameter"
          tooltip="TODO"
          validate={value => validateAmplificationParameter(value)}
        />
      )}

      <PoolSettingsRadioGroup
        customInputLabel="Custom pool hooks address"
        customInputType="address"
        name="poolHooksContract"
        options={poolHooksOptions}
        title="Pool hooks"
        tooltip="TODO"
        validate={value => validatePoolHooksContract(value)}
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
