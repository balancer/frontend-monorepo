import { calculateInvariantWithError } from './gyroEMath'
import { calcSpotPrice0in1 } from './gyroECLPMath'
import { divDownMagU, mulDownMagU } from './gyroSignedFixedPoint'
import { _normalizeBalances } from './helpers'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { safeParseFixedBigInt } from '@repo/lib/shared/utils/numbers'
import { Pool } from '../../pool/pool.types'
import { isGyroEPool } from '../../pool/pool.helpers'
import { ZERO } from './constants'

type GyroEParams = {
  balanceIn: bigint
  balanceOut: bigint
  decimalsIn: number
  decimalsOut: number
  gyroEParams: {
    alpha: bigint
    beta: bigint
    c: bigint
    s: bigint
    lambda: bigint
  }
  derivedGyroEParams: {
    tauAlpha: Vector2
    tauBeta: Vector2
    u: bigint
    v: bigint
    w: bigint
    z: bigint
    dSq: bigint
  }
  swapFee: bigint
  tokenRates: readonly [bigint, bigint] | null
}

type Vector2 = {
  x: bigint
  y: bigint
}

type GyroPoolParams = GyroEParams

export function destructureRequiredPoolParams(
  pool: Pool,
  tokenRates?: readonly [bigint, bigint] | null
) {
  if (!isGyroEPool(pool)) return null

  const tokens = pool.poolTokens
  if (!tokens[0].balance || !tokens[1].balance) return null

  const balanceIn = safeParseFixedBigInt(tokens[0].balance, tokens[0].decimals)
  const balanceOut = safeParseFixedBigInt(tokens[1].balance, tokens[1].decimals)

  return {
    balanceIn,
    balanceOut,
    decimalsIn: tokens[0].decimals,
    decimalsOut: tokens[1].decimals,
    gyroEParams: {
      alpha: safeParseFixedBigInt(pool.alpha as string, 18),
      beta: safeParseFixedBigInt(pool.beta as string, 18),
      c: safeParseFixedBigInt(pool.c as string, 18),
      s: safeParseFixedBigInt(pool.s as string, 18),
      lambda: safeParseFixedBigInt(pool.lambda as string, 18),
    },
    derivedGyroEParams: {
      tauAlpha: {
        x: safeParseFixedBigInt(pool.tauAlphaX as string, 38),
        y: safeParseFixedBigInt(pool.tauAlphaY as string, 38),
      },
      tauBeta: {
        x: safeParseFixedBigInt(pool.tauBetaX as string, 38),
        y: safeParseFixedBigInt(pool.tauBetaY as string, 38),
      },
      u: safeParseFixedBigInt(pool.u as string, 38),
      v: safeParseFixedBigInt(pool.v as string, 38),
      w: safeParseFixedBigInt(pool.w as string, 38),
      z: safeParseFixedBigInt(pool.z as string, 38),
      dSq: safeParseFixedBigInt(pool.dSq as string, 38),
    },
    swapFee: safeParseFixedBigInt(pool.dynamicData.swapFee, 16),
    tokenRates: tokenRates ?? null,
  } as GyroEParams
}

export function calculateSpotPrice(poolType: GqlPoolType, params: GyroPoolParams): bigint {
  let price = ZERO

  if (poolType === GqlPoolType.Gyroe) {
    price = calculateGyroESpotPrice(params as GyroEParams)
  }

  return price
}

function calculateGyroESpotPrice(params: GyroEParams): bigint {
  const normalizedBalances = _normalizeBalances(
    [params.balanceIn, params.balanceOut],
    [params.decimalsIn, params.decimalsOut]
  )

  const [rate0, rate1] = params.tokenRates ?? []

  const scaledBalances =
    rate0 && rate1
      ? [mulDownMagU(normalizedBalances[0], rate0), mulDownMagU(normalizedBalances[1], rate1)]
      : normalizedBalances

  const [invariant] = calculateInvariantWithError(
    scaledBalances,
    params.gyroEParams,
    params.derivedGyroEParams
  )

  const newSpotPrice = calcSpotPrice0in1(
    scaledBalances,
    params.gyroEParams,
    params.derivedGyroEParams,
    invariant
  )

  if (rate0 && rate1) {
    const scalingFactor = divDownMagU(rate0, rate1)
    return mulDownMagU(newSpotPrice, scalingFactor)
  }
  return newSpotPrice
}
