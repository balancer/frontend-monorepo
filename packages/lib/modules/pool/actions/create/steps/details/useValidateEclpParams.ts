import { useEffect, useState } from 'react'
import { GyroECLPMath } from '@balancer-labs/balancer-maths'
import { computeDerivedEclpParams } from '@balancer/sdk'
import { PoolType } from '@balancer/sdk'
import { parseUnits } from 'viem'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'

export function useValidateEclpParams() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { poolType, eclpConfigForm } = usePoolCreationForm()
  const { alpha, beta, c, s, lambda } = eclpConfigForm.watch()

  useEffect(() => {
    if (poolType !== PoolType.GyroE) return
    if (!alpha || !beta || !c || !s || !lambda) return

    const rawEclpParams = {
      alpha: parseUnits(alpha, 18),
      beta: parseUnits(beta, 18),
      c: parseUnits(c, 18),
      s: parseUnits(s, 18),
      lambda: parseUnits(lambda, 18),
    }

    try {
      GyroECLPMath.validateParams(rawEclpParams)
      const derivedParams = computeDerivedEclpParams(rawEclpParams)
      GyroECLPMath.validateDerivedParams(rawEclpParams, derivedParams)
      setErrorMessage(null)
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('An unknown error occurred')
      }
    }
  }, [alpha, beta, c, s, lambda, poolType])

  return { errorMessage, isEclpParamsValid: !errorMessage }
}
