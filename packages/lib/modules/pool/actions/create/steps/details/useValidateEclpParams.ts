import { useMemo } from 'react'
import { GyroECLPMath } from '@balancer-labs/balancer-maths'
import { computeDerivedEclpParams, PoolType } from '@balancer/sdk'
import { parseUnits } from 'viem'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { DEFAULT_DECIMALS } from '../../constants'
import { useWatch } from 'react-hook-form'

export function useValidateEclpParams() {
  const { eclpConfigForm, poolCreationForm } = usePoolCreationForm()
  const poolType = useWatch({ control: poolCreationForm.control, name: 'poolType' })
  const [alpha, beta, c, s, lambda] = useWatch({
    control: eclpConfigForm.control,
    name: ['alpha', 'beta', 'c', 's', 'lambda'],
  })

  const errorMessage = useMemo(() => {
    if (poolType !== PoolType.GyroE) return null
    if (!alpha || !beta || !c || !s || !lambda) return null

    const rawEclpParams = {
      alpha: parseUnits(alpha, DEFAULT_DECIMALS),
      beta: parseUnits(beta, DEFAULT_DECIMALS),
      c: parseUnits(c, DEFAULT_DECIMALS),
      s: parseUnits(s, DEFAULT_DECIMALS),
      lambda: parseUnits(lambda, DEFAULT_DECIMALS),
    }

    try {
      GyroECLPMath.validateParams(rawEclpParams)
      const derivedParams = computeDerivedEclpParams(rawEclpParams)
      GyroECLPMath.validateDerivedParams(rawEclpParams, derivedParams)
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'An unknown error occurred'
    }
  }, [alpha, beta, c, s, lambda, poolType])

  return { errorMessage, isEclpParamsValid: !errorMessage }
}
