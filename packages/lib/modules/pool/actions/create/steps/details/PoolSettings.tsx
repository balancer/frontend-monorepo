import { VStack, Heading, Text } from '@chakra-ui/react'
import { zeroAddress } from 'viem'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useAccount } from 'wagmi'
import { PoolSettingsRadioGroup } from './PoolSettingsRadioGroup'
import { LiquidityManagement } from './LiquidityManagement'
import { useValidatePoolConfig } from '../../useValidatePoolConfig'
import { BlockExplorerLink } from '@repo/lib/shared/components/BlockExplorerLink'
import { useValidatePoolHooksContract } from './useValidatePoolHooksContract'
import { SWAP_FEE_PERCENTAGE_OPTIONS, AMPLIFICATION_PARAMETER_OPTIONS } from '../../constants'
import { Address } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolSettingsValidator } from '../../validators'

export type PoolSettingsOption = {
  label: string
  value: string | undefined
  detail?: React.ReactNode
}

export function PoolSettings() {
  const { address } = useAccount()
  const { network, poolType, poolHooksContract } = usePoolCreationForm()
  const { isStablePool } = useValidatePoolConfig()

  const { isValidHooksContract, isPendingHooksContractValidation } =
    useValidatePoolHooksContract(poolHooksContract)

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

  const poolHooksOptions: PoolSettingsOption[] = [{ label: 'No hooks', value: zeroAddress }]

  const amplificationParameterOptions: PoolSettingsOption[] = AMPLIFICATION_PARAMETER_OPTIONS.map(
    value => ({ label: value, value })
  )

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
        validate={address => PoolSettingsValidator.swapFeeManager(address)}
      />

      <PoolSettingsRadioGroup
        customInputLabel="Custom pause manager address"
        customInputType="address"
        name="pauseManager"
        options={poolManagerOptions}
        title="Pause manager"
        tooltip="TODO"
        validate={address => PoolSettingsValidator.pauseManager(address)}
      />

      <PoolSettingsRadioGroup
        customInputLabel="Custom swap fee"
        customInputType="number"
        isPercentage={true}
        name="swapFeePercentage"
        options={swapFeePercentageOptions}
        title="Swap fee percentage"
        tooltip="TODO"
        validate={value => PoolSettingsValidator.swapFeePercentage(value, poolType)}
      />

      {isStablePool && (
        <PoolSettingsRadioGroup
          customInputLabel="Custom amplification parameter"
          customInputType="number"
          name="amplificationParameter"
          options={amplificationParameterOptions}
          title="Amplification parameter"
          tooltip="TODO"
          validate={value => PoolSettingsValidator.amplificationParameter(value)}
        />
      )}

      <PoolSettingsRadioGroup
        customInputLabel="Custom pool hooks address"
        customInputType="address"
        name="poolHooksContract"
        options={poolHooksOptions}
        title="Pool hooks"
        tooltip="TODO"
        validate={address =>
          PoolSettingsValidator.poolHooksContract(
            address,
            isValidHooksContract,
            isPendingHooksContractValidation
          )
        }
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
