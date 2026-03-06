import { Checkbox, Link, Text, Separator } from '@chakra-ui/react'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { isBalancer } from '@repo/lib/config/getProjectConfig'
import { isWeightedPool, isCowPool } from '../../helpers'
import { useWatch } from 'react-hook-form'

export function PoolCreationRiskCheckboxes() {
  const { poolCreationForm } = usePoolCreationForm()
  const [hasAcceptedTokenWeightsRisk, hasAcceptedPoolCreationRisk, poolType] = useWatch({
    control: poolCreationForm.control,
    name: ['hasAcceptedTokenWeightsRisk', 'hasAcceptedPoolCreationRisk', 'poolType'],
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

  const showTokenWeightsRiskCheckbox = isWeightedPool(poolType) || isCowPool(poolType)

  return (
    <>
      <Separator />
      {showTokenWeightsRiskCheckbox && (
        <Checkbox.Root
          alignItems="flex-start"
          checked={hasAcceptedTokenWeightsRisk}
          onCheckedChange={(e: { checked: boolean }) =>
            poolCreationForm.setValue('hasAcceptedTokenWeightsRisk', e.checked)
          }
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label>
            <Checkbox.Root>
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox.Root>
            <Checkbox.Root>
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label>
                <Checkbox.Root>
                  <Checkbox.HiddenInput />
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                </Checkbox.Root>
              </Checkbox.Label>
            </Checkbox.Root>
            <Checkbox.Root>
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label>
                <Text {...textProps}>
                  I understand that I will likely get rekt if the USD values of each token are not
                  proportional to the token weights.
                </Text>
              </Checkbox.Label>
            </Checkbox.Root>
          </Checkbox.Label>
        </Checkbox.Root>
      )}
      <Checkbox.Root
        alignItems="flex-start"
        checked={hasAcceptedPoolCreationRisk}
        onCheckedChange={(e: { checked: boolean }) =>
          poolCreationForm.setValue('hasAcceptedPoolCreationRisk', e.checked)
        }
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Label>
          <Checkbox.Root>
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox.Root>
          <Checkbox.Root>
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>
              <Checkbox.Root>
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
              </Checkbox.Root>
            </Checkbox.Label>
          </Checkbox.Root>
          <Checkbox.Root>
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label>
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
            </Checkbox.Label>
          </Checkbox.Root>
        </Checkbox.Label>
      </Checkbox.Root>
    </>
  )
}
