import { VStack, HStack, Text } from '@chakra-ui/react'
import { BalPopover } from '@repo/lib/shared/components/popover/BalPopover'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { PoolCreationCheckbox } from '../../PoolCreationCheckbox'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { validatePoolType } from '../../validatePoolCreationForm'
import { useEffect } from 'react'
import { usePoolHooksContract } from './usePoolHooksContract'

export function LiquidityManagement() {
  const {
    poolType,
    enableDonation,
    disableUnbalancedLiquidity,
    poolHooksContract,
    poolCreationForm,
    network,
  } = usePoolCreationForm()

  const { hookFlags } = usePoolHooksContract(poolHooksContract, network)
  const isStableSurgePool = validatePoolType.isStableSurgePool(poolType)
  const isHyperSurgePool = validatePoolType.isHyperSurgePool(poolType)

  useEffect(() => {
    // if contract has this flag set to true, enforce `disableUnbalancedLiquidity: true` to avoid tx revert
    if (hookFlags?.enableHookAdjustedAmounts) {
      poolCreationForm.setValue('disableUnbalancedLiquidity', true)
    }
    // the stable surge pool factory only supports `disableUnbalancedLiquidity: false`
    if (isStableSurgePool || isHyperSurgePool) {
      poolCreationForm.setValue('disableUnbalancedLiquidity', false)
    }
  }, [hookFlags, isStableSurgePool, isHyperSurgePool, poolCreationForm])

  const isDisabled = isStableSurgePool || isHyperSurgePool || hookFlags?.enableHookAdjustedAmounts

  return (
    <VStack align="start" spacing="md" w="full">
      <HStack>
        <Text textAlign="start" w="full">
          Liquidity Management
        </Text>
        <BalPopover text={'TODO'}>
          <InfoIcon />
        </BalPopover>
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
