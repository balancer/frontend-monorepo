import { GqlPoolGyro } from '@repo/lib/shared/services/api/generated/graphql'
import { Pool } from '../pool/pool.types'
import { isGyroEPool } from '../pool/pool.helpers'

export function drawLiquidityECLP(
  pool: Pool,
  tokenRateScalingFactorString?: string
): [number, number][] | null {
  if (!isGyroEPool(pool) && tokenRateScalingFactorString) {
    return null
  }

  const gyroPool = pool as GqlPoolGyro

  const [alpha, beta, s, c, lambda, scalingFactor] = [
    gyroPool.alpha,
    gyroPool.beta,
    gyroPool.s,
    gyroPool.c,
    gyroPool.lambda,
    tokenRateScalingFactorString,
  ].map(el => Number(el))

  const priceRange = [alpha * scalingFactor, beta * scalingFactor]
  const granularity = (priceRange[1] - priceRange[0]) / 1000

  const data = Array.from(
    { length: (priceRange[1] - priceRange[0]) / granularity + 1 },
    (_, index) => {
      const price = index * granularity + priceRange[0]
      return [price, liquidityFunction(price, c, s, lambda, scalingFactor)]
    }
  ) as [number, number][]

  return data
}

function liquidityFunction(
  price: number,
  c: number,
  s: number,
  lambda: number,
  scalingFactor: number,
  r = 1
): number {
  return (
    ((c * lambda * s) /
      ((((price / scalingFactor) * s) / lambda + c / lambda) *
        Math.sqrt(
          ((c * price) / scalingFactor - s) ** 2 /
            (((price / scalingFactor) * s) / lambda + c / lambda) ** 2 +
            1
        )) -
      (((c * price) / scalingFactor - s) *
        lambda *
        s *
        ((((c * price) / scalingFactor - s) * c) /
          (((price / scalingFactor) * s) / lambda + c / lambda) ** 2 -
          (((c * price) / scalingFactor - s) ** 2 * s) /
            (lambda * (((price / scalingFactor) * s) / lambda + c / lambda) ** 3))) /
        ((((price / scalingFactor) * s) / lambda + c / lambda) *
          (((c * price) / scalingFactor - s) ** 2 /
            (((price / scalingFactor) * s) / lambda + c / lambda) ** 2 +
            1) **
            (3 / 2)) -
      (((c * price) / scalingFactor - s) * s ** 2) /
        ((((price / scalingFactor) * s) / lambda + c / lambda) ** 2 *
          Math.sqrt(
            ((c * price) / scalingFactor - s) ** 2 /
              (((price / scalingFactor) * s) / lambda + c / lambda) ** 2 +
              1
          )) +
      (c *
        ((((c * price) / scalingFactor - s) * c) /
          (((price / scalingFactor) * s) / lambda + c / lambda) ** 2 -
          (((c * price) / scalingFactor - s) ** 2 * s) /
            (lambda * (((price / scalingFactor) * s) / lambda + c / lambda) ** 3))) /
        (((c * price) / scalingFactor - s) ** 2 /
          (((price / scalingFactor) * s) / lambda + c / lambda) ** 2 +
          1) **
          (3 / 2)) *
    r
  )
}
