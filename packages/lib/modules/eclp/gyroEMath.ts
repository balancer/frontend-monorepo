import { ONE_XP, SMALL } from './constants'
import {
  divDown,
  divUpMagU,
  divXpU,
  mulDown,
  mulDownXpToNpU,
  mulUpMagU,
  mulUpXpToNpU,
  sqrt,
} from './gyroSignedFixedPoint'
import { MAX_BALANCES, MAX_INVARIANT } from './constants'
import {
  calcSpotPriceXGivenY,
  calcSpotPriceYGivenX,
  dPxDXOut,
  dPxDYIn,
  dPyDXIn,
  dPyDYOut,
  normalizedLiquidityXIn,
  normalizedLiquidityYIn,
} from './gyroEMathFunctions'
import {
  DerivedGyroEParams,
  GyroEParams,
  Vector2,
  calcAChiAChiInXp,
  calcAtAChi,
  calcInvariantSqrt,
  calcXGivenY,
  calcYGivenX,
  checkAssetBounds,
} from './gyroEMathHelpers'

const ONE = 10n ** 18n // Equivalent to WeiPerEther

export function calculateNormalizedLiquidity(
  balances: bigint[],
  params: GyroEParams,
  derived: DerivedGyroEParams,
  r: Vector2,
  fee: bigint,
  tokenInIsToken0: boolean
): bigint {
  if (tokenInIsToken0) {
    return normalizedLiquidityXIn(balances, params, derived, fee, r)
  } else {
    return normalizedLiquidityYIn(balances, params, derived, fee, r)
  }
}

export function calculateInvariantWithError(
  balances: bigint[],
  params: GyroEParams,
  derived: DerivedGyroEParams
): [bigint, bigint] {
  const [x, y] = balances

  if (x + y > MAX_BALANCES) throw new Error('MAX ASSETS EXCEEDED')
  const AtAChi = calcAtAChi(x, y, params, derived)

  // eslint-disable-next-line prefer-const
  let [square_root, err] = calcInvariantSqrt(x, y, params, derived)

  if (square_root > 0n) {
    err = divUpMagU(err + 1n, square_root * 2n)
  } else {
    err = err > 0n ? sqrt(err, 5n) : 10n ** 9n
  }

  err = mulUpMagU(params.lambda, x + y) / ONE_XP + err + 1n
  err = err * 20n

  const mulDenominator = divXpU(ONE_XP, calcAChiAChiInXp(params, derived) - ONE_XP)
  const invariant = mulDownXpToNpU(AtAChi + square_root - err, mulDenominator)
  err = mulUpXpToNpU(err, mulDenominator)

  err =
    err +
    (mulUpXpToNpU(invariant, mulDenominator) *
      ((params.lambda * params.lambda) / 10n ** 36n) *
      40n) /
      ONE_XP +
    1n

  if (invariant + err > MAX_INVARIANT) throw new Error('MAX INVARIANT EXCEEDED')

  return [invariant, err]
}

export function calcOutGivenIn(
  balances: bigint[],
  amountIn: bigint,
  tokenInIsToken0: boolean,
  params: GyroEParams,
  derived: DerivedGyroEParams,
  invariant: Vector2
): bigint {
  if (amountIn < SMALL) return 0n

  const ixIn = Number(!tokenInIsToken0)
  const ixOut = Number(tokenInIsToken0)

  const calcGiven = tokenInIsToken0 ? calcYGivenX : calcXGivenY

  const balInNew = balances[ixIn] + amountIn

  checkAssetBounds(params, derived, invariant, balInNew, ixIn)
  const balOutNew = calcGiven(balInNew, params, derived, invariant)
  const amountOut = balances[ixOut] - balOutNew
  if (amountOut < 0n) {
    // Should never happen; check anyways to catch a numerical bug.
    throw new Error('ASSET BOUNDS EXCEEDED 1')
  }

  return amountOut
}

export function calcInGivenOut(
  balances: bigint[],
  amountOut: bigint,
  tokenInIsToken0: boolean,
  params: GyroEParams,
  derived: DerivedGyroEParams,
  invariant: Vector2
): bigint {
  if (amountOut < SMALL) return 0n

  const ixIn = Number(!tokenInIsToken0)
  const ixOut = Number(tokenInIsToken0)

  const calcGiven = tokenInIsToken0 ? calcXGivenY : calcYGivenX

  if (amountOut > balances[ixOut]) throw new Error('ASSET BOUNDS EXCEEDED 2')
  const balOutNew = balances[ixOut] - amountOut

  const balInNew = calcGiven(balOutNew, params, derived, invariant)
  checkAssetBounds(params, derived, invariant, balInNew, ixIn)
  const amountIn = balInNew - balances[ixIn]

  if (amountIn < 0n) {
    // Should never happen; check anyways to catch a numerical bug.
    throw new Error('ASSET BOUNDS EXCEEDED 3')
  }
  return amountIn
}

export function calcSpotPriceAfterSwapOutGivenIn(
  balances: bigint[],
  amountIn: bigint,
  tokenInIsToken0: boolean,
  params: GyroEParams,
  derived: DerivedGyroEParams,
  invariant: Vector2,
  swapFee: bigint
): bigint {
  const ixIn = Number(!tokenInIsToken0)
  const f = ONE - swapFee

  const calcSpotPriceGiven = tokenInIsToken0 ? calcSpotPriceYGivenX : calcSpotPriceXGivenY

  const balInNew = balances[ixIn] + amountIn
  const newSpotPriceFactor = calcSpotPriceGiven(balInNew, params, derived, invariant)
  return divDown(ONE, mulDown(newSpotPriceFactor, f))
}

export function calcSpotPriceAfterSwapInGivenOut(
  balances: bigint[],
  amountOut: bigint,
  tokenInIsToken0: boolean,
  params: GyroEParams,
  derived: DerivedGyroEParams,
  invariant: Vector2,
  swapFee: bigint
): bigint {
  const ixOut = Number(tokenInIsToken0)
  const f = ONE - swapFee

  const calcSpotPriceGiven = tokenInIsToken0 ? calcSpotPriceXGivenY : calcSpotPriceYGivenX

  const balOutNew = balances[ixOut] - amountOut
  const newSpotPriceFactor = calcSpotPriceGiven(balOutNew, params, derived, invariant)
  return divDown(newSpotPriceFactor, f)
}

export function calcDerivativePriceAfterSwapOutGivenIn(
  balances: bigint[],
  tokenInIsToken0: boolean,
  params: GyroEParams,
  derived: DerivedGyroEParams,
  invariant: Vector2,
  swapFee: bigint
): bigint {
  const ixIn = Number(!tokenInIsToken0)

  const newDerivativeSpotPriceFactor = ixIn
    ? dPxDYIn(balances, params, derived, swapFee, invariant)
    : dPyDXIn(balances, params, derived, swapFee, invariant)

  return newDerivativeSpotPriceFactor
}

export function calcDerivativeSpotPriceAfterSwapInGivenOut(
  balances: bigint[],
  tokenInIsToken0: boolean,
  params: GyroEParams,
  derived: DerivedGyroEParams,
  invariant: Vector2,
  swapFee: bigint
): bigint {
  const ixIn = Number(!tokenInIsToken0)

  const newDerivativeSpotPriceFactor = ixIn
    ? dPxDXOut(balances, params, derived, swapFee, invariant)
    : dPyDYOut(balances, params, derived, swapFee, invariant)

  return newDerivativeSpotPriceFactor
}
