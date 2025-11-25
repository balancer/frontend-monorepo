import { Box, Heading, VStack } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolCreationRiskCheckboxes } from './PoolCreationRiskCheckboxes'
import { validatePoolTokens } from '../../validatePoolCreationForm'
import { SeedAmountProportions } from './SeedAmountProportions'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { isWeightedPool, isReClammPool } from '../../helpers'
import { useFormState, useWatch } from 'react-hook-form'
import { SeedPoolAlert } from './SeedPoolAlert'
import { SeedAmountInput } from './SeedAmountInput'

export function PoolFundStep() {
  const { poolAddress, poolCreationForm } = usePoolCreationForm()
  const [poolType, poolTokens, hasAcceptedTokenWeightsRisk, hasAcceptedPoolCreationRisk] = useWatch(
    {
      control: poolCreationForm.control,
      name: [
        'poolType',
        'poolTokens',
        'hasAcceptedTokenWeightsRisk',
        'hasAcceptedPoolCreationRisk',
      ],
    }
  )
  const { hasValidationErrors } = useTokenInputsValidation()

  const isTokenAmountsValid =
    (validatePoolTokens.isValidTokenAmounts(poolTokens) && !hasValidationErrors) ||
    (isReClammPool(poolType) && !poolAddress)

  const hasAcceptedRisks = isWeightedPool(poolType)
    ? hasAcceptedTokenWeightsRisk && hasAcceptedPoolCreationRisk
    : hasAcceptedPoolCreationRisk

  const formState = useFormState({ control: poolCreationForm.control })
  const isDisabled = !formState.isValid || !hasAcceptedRisks || !isTokenAmountsValid
  const showTokenAmountInputs = !isReClammPool(poolType) || poolAddress

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <SeedPoolAlert poolType={poolType} />

        <Heading color="font.maxContrast" size="md">
          Seed initial pool liquidity
        </Heading>

        {showTokenAmountInputs && (
          <>
            {poolTokens.map((token, idx) => (
              <SeedAmountInput
                idx={idx}
                key={idx}
                poolTokens={poolTokens}
                poolType={poolType}
                token={token}
              />
            ))}

            <SeedAmountProportions displayAlert />
          </>
        )}

        <PoolCreationRiskCheckboxes />

        <PoolCreationFormAction disabled={isDisabled} />
      </VStack>
    </Box>
  )
}
