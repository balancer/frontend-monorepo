import { Checkbox, Text } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { validatePoolType } from '../../validatePoolCreationForm'

export function PoolCreationRiskCheckboxes() {
  const { poolCreationForm, poolType } = usePoolCreationForm()
  const { hasAcceptedTokenWeightsRisk, hasAcceptedPoolCreationRisk } = poolCreationForm.watch()
  const isWeightedPool = validatePoolType.isWeightedPool(poolType)

  return (
    <>
      {isWeightedPool && (
        <Checkbox
          alignItems="flex-start"
          isChecked={hasAcceptedTokenWeightsRisk}
          onChange={e => poolCreationForm.setValue('hasAcceptedTokenWeightsRisk', e.target.checked)}
          size="lg"
        >
          <Text lineHeight="1" sx={{ textWrap: 'pretty' }}>
            I understand that I will likely get rekt if the USD values of each token are not
            proportional to the token weights.
          </Text>
        </Checkbox>
      )}
      <Checkbox
        isChecked={hasAcceptedPoolCreationRisk}
        onChange={e => poolCreationForm.setValue('hasAcceptedPoolCreationRisk', e.target.checked)}
        size="lg"
      >
        <Text lineHeight="1" sx={{ textWrap: 'pretty' }}>
          I accept the{' '}
          <Text
            as="span"
            color="font.link"
            textDecoration="underline"
            textDecorationStyle="dotted"
            textDecorationThickness="1px"
            textUnderlineOffset="3px"
          >
            Risks
          </Text>{' '}
          and{' '}
          <Text
            as="span"
            color="font.link"
            textDecoration="underline"
            textDecorationStyle="dotted"
            textDecorationThickness="1px"
            textUnderlineOffset="3px"
          >
            Terms of Use
          </Text>{' '}
          for creating an a pool on Balancer.
        </Text>
      </Checkbox>
    </>
  )
}
