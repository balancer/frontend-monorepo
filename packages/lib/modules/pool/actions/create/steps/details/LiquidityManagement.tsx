import { VStack, HStack, Text } from '@chakra-ui/react'
import { InfoIconPopover } from '../../InfoIconPopover'
import { PoolCreationCheckbox } from '../../PoolCreationCheckbox'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useEffect } from 'react'
import { usePoolHooksContract } from './usePoolHooksContract'
import { isStableSurgePool, isAutoRangePool } from '../../helpers'
import { useWatch } from 'react-hook-form'
import { TooltipWithTouch } from '@repo/lib/shared/components/tooltips/TooltipWithTouch'

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

  // Compute effective value directly to avoid effect-based state mirroring
  const effectiveDisableUnbalancedLiquidity = hookFlags?.enableHookAdjustedAmounts
    ? true
    : isStableSurgePool(poolType)
      ? false
      : disableUnbalancedLiquidity

  const isUnbalancedToggleDisabled =
    isStableSurgePool(poolType) || hookFlags?.enableHookAdjustedAmounts
  const isDonationToggleDisabled = isAutoRangePool(poolType)

  const donationsToolTip = isDonationToggleDisabled
    ? 'The selected pool type does not allow donations to be enabled'
    : 'Option to add liquidity to a pool without minting additional LP tokens. Most pools should NOT allow donations. Only recommended for advanced users.'

  return (
    <VStack align="start" spacing="md" w="full">
      <HStack>
        <Text fontWeight="bold" textAlign="start" w="full">
          Liquidity management
        </Text>
        <InfoIconPopover message="Flags related to adding/removing liquidity" />
      </HStack>
      <TooltipWithTouch
        isHidden={!isStableSurgePool(poolType)}
        label="The stable surge pool factory requires unbalanced joins and removes to be enabled"
        placement="right"
      >
        <PoolCreationCheckbox
          isChecked={!disableUnbalancedLiquidity}
          isDisabled={isUnbalancedToggleDisabled}
          label="Allow unbalanced joins and removes"
          onChange={e => poolCreationForm.setValue('disableUnbalancedLiquidity', !e.target.checked)}
        />
      </TooltipWithTouch>
      <TooltipWithTouch label={donationsToolTip} placement="right">
        <PoolCreationCheckbox
          isChecked={enableDonation}
          isDisabled={isDonationToggleDisabled}
          label="Allow donations"
          onChange={e => poolCreationForm.setValue('enableDonation', e.target.checked)}
        />
      </TooltipWithTouch>
    </VStack>
  )
}
