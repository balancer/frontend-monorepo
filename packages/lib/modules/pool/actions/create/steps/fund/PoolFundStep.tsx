import { Box, Heading, VStack } from '@chakra-ui/react'
import { PoolCreationFormAction } from '../../PoolCreationFormAction'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolCreationRiskCheckboxes } from './PoolCreationRiskCheckboxes'
import { SeedAmountProportions } from './SeedAmountProportions'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { isWeightedPool, isReClammPool, isCowPool } from '../../helpers'
import { useFormState, useWatch } from 'react-hook-form'
import { SeedPoolAlert } from './SeedPoolAlert'
import { SeedAmountInput } from './SeedAmountInput'
import { validatePoolTokens } from '../../validatePoolCreationForm'

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

  // temp fix to prevent form submission with invalid token amounts until hasValidationErrors is fixed for page refresh
  const hasAmountError = poolTokens.some(token =>
    validatePoolTokens.hasAmountError(token, poolType)
  )

  const isTokenAmountsValid =
    (!hasAmountError && !hasValidationErrors) || (isReClammPool(poolType) && !poolAddress)

  const isWeightRiskRequired = isWeightedPool(poolType) || isCowPool(poolType)

  const hasAcceptedRisks = isWeightRiskRequired
    ? hasAcceptedTokenWeightsRisk && hasAcceptedPoolCreationRisk
    : hasAcceptedPoolCreationRisk

  const formState = useFormState({ control: poolCreationForm.control })
  const isDisabled = !formState.isValid || !hasAcceptedRisks || !isTokenAmountsValid
  const showTokenAmountInputs = !isReClammPool(poolType) || poolAddress

  return (
    <Box as="form" style={{ width: '100%' }}>
      <VStack align="start" spacing="lg" w="full">
        <Heading color="font.maxContrast" size="md">
          Seed initial pool liquidity
        </Heading>
        <SeedPoolAlert poolType={poolType} />
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
