import { Checkbox, Link, Text } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { validatePoolType } from '../../validatePoolCreationForm'
import { isBalancer } from '@repo/lib/config/getProjectConfig'

export function PoolCreationRiskCheckboxes() {
  const { poolCreationForm, poolType } = usePoolCreationForm()
  const { hasAcceptedTokenWeightsRisk, hasAcceptedPoolCreationRisk } = poolCreationForm.watch()
  const isWeightedPool = validatePoolType.isWeightedPool(poolType)

  const linkProps = {
    textDecoration: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationThickness: '1px',
    textUnderlineOffset: '3px',
    isExternal: true,
  } as const

  const textProps = {
    lineHeight: '1',
    sx: { textWrap: 'pretty' },
  }

  return (
    <>
      {isWeightedPool && (
        <Checkbox
          alignItems="flex-start"
          isChecked={hasAcceptedTokenWeightsRisk}
          onChange={e => poolCreationForm.setValue('hasAcceptedTokenWeightsRisk', e.target.checked)}
          size="lg"
        >
          <Text {...textProps}>
            I understand that I will likely get rekt if the USD values of each token are not
            proportional to the token weights.
          </Text>
        </Checkbox>
      )}
      <Checkbox
        isChecked={hasAcceptedPoolCreationRisk}
        onChange={e => poolCreationForm.setValue('hasAcceptedPoolCreationRisk', e.target.checked)}
      >
        {isBalancer ? (
          <Text {...textProps}>
            I accept the{' '}
            <Link href="/risks" {...linkProps}>
              Risks
            </Link>{' '}
            and{' '}
            <Link href="/terms-of-use" {...linkProps}>
              Terms of Use
            </Link>{' '}
            for creating a pool on Balancer.
          </Text>
        ) : (
          <Text {...textProps}>
            I accept the{' '}
            <Link href="/terms-of-service" {...linkProps}>
              Terms of Service
            </Link>{' '}
            for creating a pool on Beets.
          </Text>
        )}
      </Checkbox>
    </>
  )
}
