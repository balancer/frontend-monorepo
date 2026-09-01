import { useMemo } from 'react'
import { GyroECLPMath } from '@balancer-labs/balancer-maths'
import { computeDerivedEclpParams, PoolType } from '@balancer/sdk'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { DEFAULT_DECIMALS } from '../../constants'
import { useWatch } from 'react-hook-form'
import { calculateRotationComponents } from './gyro.helpers'
import { parseAmount } from '@repo/lib/shared/utils/numbers'

export function useValidateEclpParams() {
  const { eclpConfigForm, poolCreationForm } = usePoolCreationForm()
  const poolType = useWatch({ control: poolCreationForm.control, name: 'poolType' })

  const [alpha, beta, peakPrice, lambda] = useWatch({
    control: eclpConfigForm.control,
    name: ['alpha', 'beta', 'peakPrice', 'lambda'],
  })

  const { c, s } = calculateRotationComponents(peakPrice || '')

  const errorMessage = useMemo(() => {
    if (poolType !== PoolType.GyroE) return null
    if (!alpha || !beta || !c || !s || !lambda) return null

    const rawEclpParams = {
      alpha: parseAmount(alpha, DEFAULT_DECIMALS),
      beta: parseAmount(beta, DEFAULT_DECIMALS),
      c: parseAmount(c, DEFAULT_DECIMALS),
      s: parseAmount(s, DEFAULT_DECIMALS),
      lambda: parseAmount(lambda, DEFAULT_DECIMALS),
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
