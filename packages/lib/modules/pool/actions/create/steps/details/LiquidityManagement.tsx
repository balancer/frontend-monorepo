import { VStack, HStack, Text } from '@chakra-ui/react'
import { BalPopover } from '@repo/lib/shared/components/popover/BalPopover'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { PoolCreationCheckbox } from '../../PoolCreationCheckbox'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { validatePoolType } from '../../validatePoolCreationForm'

export function LiquidityManagement() {
  const { poolType, enableDonation, disableUnbalancedLiquidity, poolCreationForm } =
    usePoolCreationForm()

  const isStableSurgePool = validatePoolType.isStableSurgePool(poolType)

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
        isDisabled={isStableSurgePool} // stable surge pool factory only allows `disableUnbalancedLiquidity: false`
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
