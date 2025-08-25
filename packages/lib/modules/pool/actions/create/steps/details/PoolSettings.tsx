import { VStack, Heading } from '@chakra-ui/react'
import { zeroAddress } from 'viem'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useAccount } from 'wagmi'
import { PoolSettingsRadioGroup } from './PoolSettingsRadioGroup'
import { LiquidityManagement } from './LiquidityManagement'
import { useValidatePoolConfig } from '../../useValidatePoolConfig'

export function PoolSettings() {
  const { address } = useAccount()
  const {
    swapFeeManager,
    pauseManager,
    swapFeePercentage,
    poolHooksContract,
    amplificationParameter,
  } = usePoolCreationForm()
  const { isStablePool } = useValidatePoolConfig()

  const swapFeeManagerOptions = [
    { label: 'Delegate to the balancer DAO', value: zeroAddress },
    { label: 'My connected wallet', value: address },
    { label: 'Custom', value: '' },
  ]

  const pauseManagerOptions = [
    { label: 'Delegate to the balancer DAO', value: zeroAddress },
    { label: 'My connected wallet', value: address },
    { label: 'Custom', value: '' },
  ]

  const swapFeePercentageOptions = [
    { label: '0.30%', value: '0.3', reccomendation: 'Best for most weighted pairs' },
    { label: '1.0%', value: '1', reccomendation: 'Best for exotic pairs' },
    { label: 'Custom', value: '' },
  ]

  const poolHooksOptions = [
    { label: 'No hooks', value: zeroAddress },
    { label: 'Custom', value: '' },
  ]

  const isCustomOption = (selectedValue: string, options: { value: string | undefined }[]) => {
    const predefinedValues = options.slice(0, -1).map(option => option.value)
    return !predefinedValues.includes(selectedValue)
  }

  const amplificationParameterOptions = [
    { label: '100', value: '100' },
    { label: '1000', value: '1000' },
    { label: 'Custom', value: '' },
  ]

  return (
    <VStack align="start" spacing="lg" w="full">
      <Heading color="font.maxContrast" size="md">
        Pool settings
      </Heading>

      <PoolSettingsRadioGroup
        customInputLabel="Custom swap fee manager address"
        customInputType="address"
        isCustom={isCustomOption(swapFeeManager, swapFeeManagerOptions)}
        name="swapFeeManager"
        options={swapFeeManagerOptions}
        title="Swap fee manager"
        tooltip="TODO"
        validate={() => true}
      />

      <PoolSettingsRadioGroup
        customInputLabel="Custom pause manager address"
        customInputType="address"
        isCustom={isCustomOption(pauseManager, pauseManagerOptions)}
        name="pauseManager"
        options={pauseManagerOptions}
        title="Pause manager"
        tooltip="TODO"
        validate={() => true}
      />

      <PoolSettingsRadioGroup
        customInputLabel="Custom swap fee"
        customInputType="number"
        isCustom={isCustomOption(swapFeePercentage, swapFeePercentageOptions)}
        isPercentage={true}
        name="swapFeePercentage"
        options={swapFeePercentageOptions}
        title="Swap fee percentage"
        tooltip="TODO"
        validate={() => true}
      />

      {isStablePool && (
        <PoolSettingsRadioGroup
          customInputLabel="Custom amplification parameter"
          customInputType="number"
          isCustom={isCustomOption(amplificationParameter, amplificationParameterOptions)}
          name="amplificationParameter"
          options={amplificationParameterOptions}
          title="Amplification parameter"
          tooltip="TODO"
          validate={() => true}
        />
      )}

      <PoolSettingsRadioGroup
        customInputLabel="Custom pool hooks address"
        customInputType="address"
        isCustom={isCustomOption(poolHooksContract, poolHooksOptions)}
        name="poolHooksContract"
        options={poolHooksOptions}
        title="Pool hooks"
        tooltip="TODO"
        validate={() => true}
      />

      <LiquidityManagement />
    </VStack>
  )
}
