import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { HStack, Text, Checkbox } from '@chakra-ui/react'
import { InfoIconPopover } from '../../InfoIconPopover'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { isBalancer, PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

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
        <Text fontWeight="bold">Yield fees from interest bearing assets</Text>
        <InfoIconPopover
          message={`To properly align incentives, we recommend sharing yield fees with ${PROJECT_CONFIG.projectName}`}
          placement="right-start"
        />
      </HStack>
      <Checkbox
        isChecked={paysYieldFees}
        onChange={() => updatePoolToken(tokenIndex, { paysYieldFees: !paysYieldFees })}
        size="lg"
      >
        <Text>Share yield with {PROJECT_CONFIG.projectName} protocol</Text>
      </Checkbox>
      {!paysYieldFees ? (
        isBalancer ? (
          <BalAlert
            content="Pools that don’t share yield fees with Balancer are unlikely to receive approval for a BAL liquidity mining gauge due to misalignment with the Balancer ecosystem."
            status="warning"
          />
        ) : (
          <BalAlert
            content={`Pools that don’t share yield fees with ${PROJECT_CONFIG.projectName} are unlikely to receive approval for a ${PROJECT_CONFIG.projectName} liquidity mining gauge due to misalignment with the ${PROJECT_CONFIG.projectName} ecosystem.`}
            status="warning"
          />
        )
      ) : null}
    </>
  )
}
