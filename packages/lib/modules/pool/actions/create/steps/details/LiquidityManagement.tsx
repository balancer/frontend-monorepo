import { VStack, HStack, Text } from '@chakra-ui/react'
import { InfoIconPopover } from '../../InfoIconPopover'
import { PoolCreationCheckbox } from '../../PoolCreationCheckbox'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useEffect } from 'react'
import { usePoolHooksContract } from './usePoolHooksContract'
import { isStableSurgePool } from '../../helpers'
import { useWatch } from 'react-hook-form'

export function LiquidityManagement() {
  const { poolCreationForm } = usePoolCreationForm()
  const [poolType, enableDonation, disableUnbalancedLiquidity, poolHooksContract, network] =
    useWatch({
      control: poolCreationForm.control,
      name: [
        'poolType',
        'enableDonation',
        'disableUnbalancedLiquidity',
        'poolHooksContract',
        'network',
      ],
    })

  const { hookFlags } = usePoolHooksContract(poolHooksContract, network)

  useEffect(() => {
    // if contract has this flag set to true, enforce `disableUnbalancedLiquidity: true` to avoid tx revert
    if (hookFlags?.enableHookAdjustedAmounts) {
      poolCreationForm.setValue('disableUnbalancedLiquidity', true)
    }
    // the stable surge pool factory only supports `disableUnbalancedLiquidity: false`
    if (isStableSurgePool(poolType)) {
      poolCreationForm.setValue('disableUnbalancedLiquidity', false)
    }
  }, [hookFlags, poolType])

  const isDisabled = isStableSurgePool(poolType) || hookFlags?.enableHookAdjustedAmounts

  return (
    <VStack align="start" spacing="md" w="full">
      <HStack>
        <Text fontWeight="bold" textAlign="start" w="full">
          Liquidity Management
        </Text>
        <InfoIconPopover message="Flags related to adding/removing liquidity" />
      </HStack>
      <PoolCreationCheckbox
        isChecked={!disableUnbalancedLiquidity}
        isDisabled={isDisabled}
        label="Allow unbalanced joins and removes"
        onChange={e => poolCreationForm.setValue('disableUnbalancedLiquidity', !e.target.checked)}
      />
      <PoolCreationCheckbox
        isChecked={enableDonation}
        label="Allow donations"
        onChange={e => poolCreationForm.setValue('enableDonation', e.target.checked)}
      />
    </VStack>
  )
}
