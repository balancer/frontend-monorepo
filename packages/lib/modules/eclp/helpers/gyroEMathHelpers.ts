import { ONE_XP, MAX_BALANCES } from './constants'
import {
  divDown,
  divDownMagU,
  divUpMagU,
  divXpU,
  mulDown,
  mulDownMagU,
  mulDownXpToNpU,
  mulUpMagU,
  mulUpXpToNpU,
  mulXpU,
  sqrt,
} from './gyroSignedFixedPoint'

/////////
/// TYPES
/////////

export type GyroEParams = {
  alpha: bigint
  beta: bigint
  c: bigint
  s: bigint
  lambda: bigint
}

// terms in this struct are stored in extra precision (38 decimals) with final decimal rounded down
export type DerivedGyroEParams = {
  tauAlpha: Vector2
  tauBeta: Vector2
  u: bigint
  v: bigint
  w: bigint
  z: bigint
  dSq: bigint
}

export type Vector2 = {
  x: bigint
  y: bigint
}

export type QParams = {
  a: bigint
  b: bigint
  c: bigint
}

/////////
/// FEE CALCULATION
/////////

export function reduceFee(amountIn: bigint, swapFee: bigint): bigint {
  const feeAmount = mulDown(amountIn, swapFee)
  return amountIn - feeAmount
}

export function addFee(amountIn: bigint, swapFee: bigint): bigint {
  return divDown(amountIn, ONE_XP - swapFee)
}

////////
/// BALANCE CALCULATION
////////
export function normalizeBalances(balances: bigint[], decimals: number[]): bigint[] {
  const scalingFactors = decimals.map(d => BigInt(10) ** BigInt(d))
  return balances.map((bal, index) => (bal * ONE_XP) / scalingFactors[index])
}

export function balancesFromTokenInOut(
  balanceTokenIn: bigint,
  balanceTokenOut: bigint,
  tokenInIsToken0: boolean
): [bigint, bigint] {
  return tokenInIsToken0 ? [balanceTokenIn, balanceTokenOut] : [balanceTokenOut, balanceTokenIn]
}

/////////
/// INVARIANT CALC
/////////

export function calcAtAChi(x: bigint, y: bigint, p: GyroEParams, d: DerivedGyroEParams): bigint {
  const dSq2 = mulXpU(d.dSq, d.dSq)

  // (cx - sy) * (w/lambda + z) / lambda
  //      account for 2 factors of dSq (4 s,c factors)
  const termXp = divXpU(divDownMagU(divDownMagU(d.w, p.lambda) + d.z, p.lambda), dSq2)

  let val = mulDownXpToNpU(mulDownMagU(x, p.c) - mulDownMagU(y, p.s), termXp)

  // (x lambda s + y lambda c) * u, note u > 0
  let termNp =
    mulDownMagU(mulDownMagU(x, p.lambda), p.s) + mulDownMagU(mulDownMagU(y, p.lambda), p.c)
  val = val + mulDownXpToNpU(termNp, divXpU(d.u, dSq2))

  // (sx+cy) * v, note v > 0
  termNp = mulDownMagU(x, p.s) + mulDownMagU(y, p.c)
  val = val + mulDownXpToNpU(termNp, divXpU(d.v, dSq2))

  return val
}

export function calcInvariantSqrt(
  x: bigint,
  y: bigint,
  p: GyroEParams,
  d: DerivedGyroEParams
): [bigint, bigint] {
  let val = calcMinAtxAChiySqPlusAtxSq(x, y, p, d) + calc2AtxAtyAChixAChiy(x, y, p, d)
  val = val + calcMinAtyAChixSqPlusAtySq(x, y, p, d)
  const err = (mulUpMagU(x, x) + mulUpMagU(y, y)) / ONE_XP
  val = val > 0n ? sqrt(val, 5n) : 0n
  return [val, err]
}

function calcMinAtxAChiySqPlusAtxSq(
  x: bigint,
  y: bigint,
  p: GyroEParams,
  d: DerivedGyroEParams
): bigint {
  let termNp =
    mulUpMagU(mulUpMagU(mulUpMagU(x, x), p.c), p.c) +
    mulUpMagU(mulUpMagU(mulUpMagU(y, y), p.s), p.s)
  termNp = termNp - mulDownMagU(mulDownMagU(mulDownMagU(x, y), p.c * 2n), p.s)
  const termXp =
    mulXpU(d.u, d.u) +
    divDownMagU(mulXpU(d.u * 2n, d.v), p.lambda) +
    divDownMagU(divDownMagU(mulXpU(d.v, d.v), p.lambda), p.lambda)

  let val = mulDownXpToNpU(termNp * -1n, termXp)
  val =
    val +
    mulDownXpToNpU(divDownMagU(divDownMagU(termNp - 9n, p.lambda), p.lambda), divXpU(ONE_XP, d.dSq))
  return val
}

function calc2AtxAtyAChixAChiy(
  x: bigint,
  y: bigint,
  p: GyroEParams,
  d: DerivedGyroEParams
): bigint {
  let termNp = mulDownMagU(mulDownMagU(mulDownMagU(x, x) - mulUpMagU(y, y), p.c * 2n), p.s)

  const xy = mulDownMagU(y, x * 2n)
  termNp = termNp + mulDownMagU(mulDownMagU(xy, p.c), p.c) - mulDownMagU(mulDownMagU(xy, p.s), p.s)
  let termXp = mulXpU(d.z, d.u) + divDownMagU(divDownMagU(mulXpU(d.w, d.v), p.lambda), p.lambda)
  termXp = termXp + divDownMagU(mulXpU(d.w, d.u) + mulXpU(d.z, d.v), p.lambda)
  termXp = divXpU(termXp, mulXpU(mulXpU(mulXpU(d.dSq, d.dSq), d.dSq), d.dSq))
  const val = mulDownXpToNpU(termNp, termXp)
  return val
}

function calcMinAtyAChixSqPlusAtySq(
  x: bigint,
  y: bigint,
  p: GyroEParams,
  d: DerivedGyroEParams
): bigint {
  let termNp =
    mulUpMagU(mulUpMagU(mulUpMagU(x, x), p.s), p.s) +
    mulUpMagU(mulUpMagU(mulUpMagU(y, y), p.c), p.c)
  termNp = termNp + mulUpMagU(mulUpMagU(mulUpMagU(x, y), p.s * 2n), p.c)
  let termXp = mulXpU(d.z, d.z) + divDownMagU(divDownMagU(mulXpU(d.w, d.w), p.lambda), p.lambda)
  termXp = termXp + divDownMagU(mulXpU(d.z * 2n, d.w), p.lambda)
  termXp = divXpU(termXp, mulXpU(mulXpU(mulXpU(d.dSq, d.dSq), d.dSq), d.dSq))
  let val = mulDownXpToNpU(termNp * -1n, termXp)
  val = val + mulDownXpToNpU(termNp - 9n, divXpU(ONE_XP, d.dSq))
  return val
}

export function calcAChiAChiInXp(p: GyroEParams, d: DerivedGyroEParams): bigint {
  const dSq3 = mulXpU(mulXpU(d.dSq, d.dSq), d.dSq)
  let val = mulUpMagU(p.lambda, divXpU(mulXpU(d.u * 2n, d.v), dSq3))
  val = val + mulUpMagU(mulUpMagU(divXpU(mulXpU(d.u + 1n, d.u + 1n), dSq3), p.lambda), p.lambda)
  val = val + divXpU(mulXpU(d.v, d.v), dSq3)
  const termXp = divUpMagU(d.w, p.lambda) + d.z
  val = val + divXpU(mulXpU(termXp, termXp), dSq3)
  return val
}

/////////
/// SWAP AMOUNT CALC
/////////

export function checkAssetBounds(
  params: GyroEParams,
  derived: DerivedGyroEParams,
  invariant: Vector2,
  newBal: bigint,
  assetIndex: number
): void {
  if (assetIndex === 0) {
    const xPlus = maxBalances0(params, derived, invariant)
    if (newBal > MAX_BALANCES || newBal > xPlus) {
      throw new Error('ASSET BOUNDS EXCEEDED')
    }
  } else {
    const yPlus = maxBalances1(params, derived, invariant)
    if (newBal > MAX_BALANCES || newBal > yPlus) {
      throw new Error('ASSET BOUNDS EXCEEDED')
    }
  }
}

function maxBalances0(p: GyroEParams, d: DerivedGyroEParams, r: Vector2): bigint {
  const termXp1 = divXpU(d.tauBeta.x - d.tauAlpha.x, d.dSq)
  const termXp2 = divXpU(d.tauBeta.y - d.tauAlpha.y, d.dSq)
  let xp = mulDownXpToNpU(mulDownMagU(mulDownMagU(r.y, p.lambda), p.c), termXp1)
  xp = xp + (termXp2 > 0n ? mulDownMagU(r.y, p.s) : mulDownXpToNpU(mulUpMagU(r.x, p.s), termXp2))
  return xp
}

function maxBalances1(p: GyroEParams, d: DerivedGyroEParams, r: Vector2): bigint {
  const termXp1 = divXpU(d.tauBeta.x - d.tauAlpha.x, d.dSq)
  const termXp2 = divXpU(d.tauBeta.y - d.tauAlpha.y, d.dSq)
  let yp = mulDownXpToNpU(mulDownMagU(mulDownMagU(r.y, p.lambda), p.s), termXp1)
  yp = yp + (termXp2 > 0n ? mulDownMagU(r.y, p.c) : mulDownXpToNpU(mulUpMagU(r.x, p.c), termXp2))
  return yp
}

export function calcYGivenX(
  x: bigint,
  params: GyroEParams,
  d: DerivedGyroEParams,
  r: Vector2
): bigint {
  const ab: Vector2 = {
    x: virtualOffset0(params, d, r),
    y: virtualOffset1(params, d, r),
  }

  const y = solveQuadraticSwap(params.lambda, x, params.s, params.c, r, ab, d.tauBeta, d.dSq)
  return y
}

export function calcXGivenY(
  y: bigint,
  params: GyroEParams,
  d: DerivedGyroEParams,
  r: Vector2
): bigint {
  const ba: Vector2 = {
    x: virtualOffset1(params, d, r),
    y: virtualOffset0(params, d, r),
  }
  const x = solveQuadraticSwap(
    params.lambda,
    y,
    params.c,
    params.s,
    r,
    ba,
    {
      x: d.tauAlpha.x * -1n,
      y: d.tauAlpha.y,
    },
    d.dSq
  )
  return x
}

export function virtualOffset0(
  p: GyroEParams,
  d: DerivedGyroEParams,
  r: Vector2,
  switchTau?: boolean
): bigint {
  const tauValue = switchTau ? d.tauAlpha : d.tauBeta
  const termXp = divXpU(tauValue.x, d.dSq)

  let a =
    tauValue.x > 0n
      ? mulUpXpToNpU(mulUpMagU(mulUpMagU(r.x, p.lambda), p.c), termXp)
      : mulUpXpToNpU(mulDownMagU(mulDownMagU(r.y, p.lambda), p.c), termXp)

  a = a + mulUpXpToNpU(mulUpMagU(r.x, p.s), divXpU(tauValue.y, d.dSq))

  return a
}

export function virtualOffset1(
  p: GyroEParams,
  d: DerivedGyroEParams,
  r: Vector2,
  switchTau?: boolean
): bigint {
  const tauValue = switchTau ? d.tauBeta : d.tauAlpha
  const termXp = divXpU(tauValue.x, d.dSq)

  let b =
    tauValue.x < 0n
      ? mulUpXpToNpU(mulUpMagU(mulUpMagU(r.x, p.lambda), p.s), termXp * -1n)
      : mulUpXpToNpU(mulDownMagU(mulDownMagU(r.y * -1n, p.lambda), p.s), termXp)

  b = b + mulUpXpToNpU(mulUpMagU(r.x, p.c), divXpU(tauValue.y, d.dSq))
  return b
}

function solveQuadraticSwap(
  lambda: bigint,
  x: bigint,
  s: bigint,
  c: bigint,
  r: Vector2,
  ab: Vector2,
  tauBeta: Vector2,
  dSq: bigint
): bigint {
  const lamBar: Vector2 = {
    x: ONE_XP - divDownMagU(divDownMagU(ONE_XP, lambda), lambda),
    y: ONE_XP - divUpMagU(divUpMagU(ONE_XP, lambda), lambda),
  }
  const q: QParams = {
    a: 0n,
    b: 0n,
    c: 0n,
  }
  const xp = x - ab.x
  if (xp > 0n) {
    q.b = mulUpXpToNpU(mulDownMagU(mulDownMagU(xp * -1n, s), c), divXpU(lamBar.y, dSq))
  } else {
    q.b = mulUpXpToNpU(mulUpMagU(mulUpMagU(xp * -1n, s), c), divXpU(lamBar.x, dSq) + 1n)
  }
  const sTerm: Vector2 = {
    x: divXpU(mulDownMagU(mulDownMagU(lamBar.y, s), s), dSq),
    y: divXpU(mulUpMagU(mulUpMagU(lamBar.x, s), s), dSq + 1n) + 1n,
  }
  sTerm.x = ONE_XP - sTerm.x
  sTerm.y = ONE_XP - sTerm.y

  q.c = calcXpXpDivLambdaLambda(x, r, lambda, s, c, tauBeta, dSq) * -1n
  q.c = q.c + mulDownXpToNpU(mulDownMagU(r.y, r.y), sTerm.y) // r.y === currentInv + err
  q.c = q.c > 0n ? sqrt(q.c, 5n) : 0n
  if (q.b - q.c > 0n) {
    q.a = mulUpXpToNpU(q.b - q.c, divXpU(ONE_XP, sTerm.y) + 1n)
  } else {
    q.a = mulUpXpToNpU(q.b - q.c, divXpU(ONE_XP, sTerm.x))
  }
  return q.a + ab.y
}

export function calcXpXpDivLambdaLambda(
  x: bigint,
  r: Vector2,
  lambda: bigint,
  s: bigint,
  c: bigint,
  tauBeta: Vector2,
  dSq: bigint
): bigint {
  const sqVars = {
    x: mulXpU(dSq, dSq),
    y: mulUpMagU(r.x, r.x),
  }
  const q: QParams = {
    a: 0n,
    b: 0n,
    c: 0n,
  }
  let termXp = divXpU(mulXpU(tauBeta.x, tauBeta.y), sqVars.x)
  if (termXp > 0n) {
    q.a = mulUpMagU(sqVars.y, s * 2n)
    q.a = mulUpXpToNpU(mulUpMagU(q.a, c), termXp + 7n)
  } else {
    q.a = mulDownMagU(mulDownMagU(r.y, r.y), s * 2n) // r.y === currentInv + err
    q.a = mulUpXpToNpU(mulDownMagU(q.a, c), termXp)
  }

  if (tauBeta.x < 0n) {
    q.b = mulUpXpToNpU(mulUpMagU(mulUpMagU(r.x, x), c * 2n), divXpU(tauBeta.x, dSq) * -1n + 3n)
  } else {
    q.b = mulUpXpToNpU(mulDownMagU(mulDownMagU(r.y * -1n, x), c * 2n), divXpU(tauBeta.x, dSq))
  }
  q.a = q.a + q.b
  termXp = divXpU(mulXpU(tauBeta.y, tauBeta.y), sqVars.x) + 7n
  q.b = mulUpMagU(sqVars.y, s)
  q.b = mulUpXpToNpU(mulUpMagU(q.b, s), termXp)

  q.c = mulUpXpToNpU(mulDownMagU(mulDownMagU(r.y * -1n, x), s * 2n), divXpU(tauBeta.y, dSq))
  q.b = q.b + q.c + mulUpMagU(x, x)
  q.b = q.b > 0n ? divUpMagU(q.b, lambda) : divDownMagU(q.b, lambda)

  q.a = q.a + q.b
  q.a = q.a > 0n ? divUpMagU(q.a, lambda) : divDownMagU(q.a, lambda)

  termXp = divXpU(mulXpU(tauBeta.x, tauBeta.x), sqVars.x) + 7n
  const val = mulUpMagU(mulUpMagU(sqVars.y, c), c)
  return mulUpXpToNpU(val, termXp) + q.a
}

/////////
/// LINEAR ALGEBRA OPERATIONS
/////////

export function mulA(params: GyroEParams, tp: Vector2): Vector2 {
  return {
    x:
      divDownMagU(mulDownMagU(params.c, tp.x), params.lambda) -
      divDownMagU(mulDownMagU(params.s, tp.y), params.lambda),
    y: mulDownMagU(params.s, tp.x) + mulDownMagU(params.c, tp.y),
  }
}

export function scalarProd(t1: Vector2, t2: Vector2): bigint {
  return mulDownMagU(t1.x, t2.x) + mulDownMagU(t1.y, t2.y)
}
