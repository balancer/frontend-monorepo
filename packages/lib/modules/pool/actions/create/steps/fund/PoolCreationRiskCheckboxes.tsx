import { Checkbox, Divider, Link, Text } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { isBalancer } from '@repo/lib/config/getProjectConfig'
import { isWeightedPool } from '../../helpers'
import { useWatch } from 'react-hook-form'
import { PoolType } from '@balancer/sdk'

export function PoolCreationRiskCheckboxes() {
  const { poolCreationForm } = usePoolCreationForm()
  const { hasAcceptedTokenWeightsRisk, hasAcceptedPoolCreationRisk, poolType } = useWatch({
    control: poolCreationForm.control,
  })

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
      <Divider />
      {isWeightedPool(poolType || PoolType.Stable) && (
        <Checkbox
          alignItems="flex-start"
          isChecked={hasAcceptedTokenWeightsRisk}
          onChange={e => poolCreationForm.setValue('hasAcceptedTokenWeightsRisk', e.target.checked)}
        >
          <Text {...textProps}>
            I understand that I will likely get rekt if the USD values of each token are not
            proportional to the token weights.
          </Text>
        </Checkbox>
      )}
      <Checkbox
        alignItems="flex-start"
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
