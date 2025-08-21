import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { HStack, Text, Checkbox } from '@chakra-ui/react'
import { InfoIconPopover } from '../../InfoIconPopover'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'

export function ShareYieldFeesCheckbox({
  tokenIndex,
  paysYieldFees,
}: {
  tokenIndex: number
  paysYieldFees: boolean
}) {
  const { updatePoolToken } = usePoolCreationForm()

  return (
    <>
      <HStack spacing="xs">
        <Text>Yield fees from interest bearing assets</Text>
        <InfoIconPopover
          message="To properly align incentives, we reccomend sharing yield fees with Balancer"
          placement="right-start"
        />
      </HStack>
      <Checkbox
        isChecked={paysYieldFees}
        onChange={() => updatePoolToken(tokenIndex, { paysYieldFees: !paysYieldFees })}
        size="lg"
      >
        <Text>Share yield with Balancer protocol</Text>
      </Checkbox>
      {!paysYieldFees && (
        <BalAlert
          content="Pools that don’t share yield fees with Balancer are unlikely to receive approval for a BAL liquidity mining gauge due to misalignment with the Balancer ecosystem."
          status="warning"
        />
      )}
    </>
  )
}
