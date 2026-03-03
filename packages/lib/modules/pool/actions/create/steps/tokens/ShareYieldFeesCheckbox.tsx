import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { HStack, Text, Checkbox } from '@chakra-ui/react';
import { InfoIconPopover } from '../../InfoIconPopover'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { isBalancer, PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function ShareYieldFeesCheckbox({
  tokenIndex,
  paysYieldFees }: {
  tokenIndex: number
  paysYieldFees: boolean
}) {
  const { updatePoolToken } = usePoolCreationForm()

  return (
    <>
      <HStack gap="xs">
        <Text fontWeight="bold">Yield fees from interest bearing assets</Text>
        <InfoIconPopover
          message={`To properly align incentives, we recommend sharing yield fees with ${PROJECT_CONFIG.projectName}`}
          placement="right-start"
        />
      </HStack>
      <Checkbox.Root
        onCheckedChange={() => updatePoolToken(tokenIndex, { paysYieldFees: !paysYieldFees })}
        size="lg"
        checked={paysYieldFees}
      ><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control></Checkbox.Root></Checkbox.Label></Checkbox.Root><Checkbox.Root><Checkbox.HiddenInput /><Checkbox.Control><Checkbox.Indicator /></Checkbox.Control><Checkbox.Label>
          <Text>Share yield with {PROJECT_CONFIG.projectName} protocol</Text>
        </Checkbox.Label></Checkbox.Root></Checkbox.Label></Checkbox.Root>
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
  );
}
