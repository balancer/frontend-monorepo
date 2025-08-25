import { VStack, HStack, Text } from '@chakra-ui/react'
import { BalPopover } from '@repo/lib/shared/components/popover/BalPopover'
import { InfoIcon } from '@repo/lib/shared/components/icons/InfoIcon'
import { PoolCreationCheckbox } from '../../PoolCreationCheckbox'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useValidatePoolConfig } from '../../useValidatePoolConfig'

export function LiquidityManagement() {
  const {
    enableDonation,
    disableUnbalancedLiquidity,
    poolConfigForm: { setValue },
  } = usePoolCreationForm()

  const { isStableSurgePool } = useValidatePoolConfig()

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
        onChange={e => setValue('disableUnbalancedLiquidity', !e.target.checked)}
      />
      <PoolCreationCheckbox
        isChecked={enableDonation}
        label="Allow donations"
        onChange={e => setValue('enableDonation', e.target.checked)}
      />
    </VStack>
  )
}
