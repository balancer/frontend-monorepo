import { ONE, ZERO, ONE_XP, ONE_19 } from './constants'

// Types
type GyroEParams = {
  alpha: bigint
  beta: bigint
  c: bigint
  s: bigint
  lambda: bigint
}

type DerivedGyroEParams = {
  tauAlpha: Vector2
  tauBeta: Vector2
  u: bigint
  v: bigint
  w: bigint
  z: bigint
  dSq: bigint
}

type Vector2 = {
  x: bigint
  y: bigint
}

// Functions

export function calcSpotPrice0in1(
  balances: bigint[],
  params: GyroEParams,
  derived: DerivedGyroEParams,
  invariant: bigint
): bigint {
  const r: Vector2 = { x: invariant, y: invariant }
  const ab: Vector2 = {
    x: virtualOffset0(params, derived, r),
    y: virtualOffset1(params, derived, r),
  }

  let vec: Vector2 = {
    x: balances[0] - ab.x,
    y: balances[1] - ab.y,
  }

  vec = mulA(params, vec)
  const pc: Vector2 = { x: divDownMagU(vec.x, vec.y), y: ONE }

  const pgx = scalarProd(pc, mulA(params, { x: ONE, y: ZERO }))
  const px = divDownMag(pgx, scalarProd(pc, mulA(params, { x: ZERO, y: ONE })))

  return px
}

// Helpers

function virtualOffset0(p: GyroEParams, d: DerivedGyroEParams, r: Vector2): bigint {
  const termXp = divXpU(d.tauBeta.x, d.dSq)

  let a =
    d.tauBeta.x >= 0n
      ? mulUpXpToNpU(mulUpMagU(mulUpMagU(r.x, p.lambda), p.c), termXp)
      : mulUpXpToNpU(mulDownMagU(mulDownMagU(r.y, p.lambda), p.c), termXp)

  a += mulUpXpToNpU(mulUpMagU(r.x, p.s), divXpU(d.tauBeta.y, d.dSq))

  return a
}

function virtualOffset1(p: GyroEParams, d: DerivedGyroEParams, r: Vector2): bigint {
  const termXp = divXpU(d.tauAlpha.x, d.dSq)
  let b =
    d.tauAlpha.x < 0n
      ? mulUpXpToNpU(mulUpMagU(mulUpMagU(r.x, p.lambda), p.s), -termXp)
      : mulUpXpToNpU(mulDownMagU(mulDownMagU(-r.y, p.lambda), p.s), termXp)

  b += mulUpXpToNpU(mulUpMagU(r.x, p.c), divXpU(d.tauAlpha.y, d.dSq))

  return b
}

// Arithmetic

function divXpU(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error('Zero division')
  return (a * ONE_XP) / b
}

function mulDownMagU(a: bigint, b: bigint): bigint {
  return (a * b) / ONE
}

function mulUpMagU(a: bigint, b: bigint): bigint {
  const product = a * b
  return product >= 0n ? (product - 1n) / ONE + 1n : (product + 1n) / ONE - 1n
}

function mulUpXpToNpU(a: bigint, b: bigint): bigint {
  const b1 = b / ONE_19
  const b2 = b % ONE_19

  const prod1 = a * b1
  const prod2 = a * b2

  return (prod1 + prod2 / ONE_19) / ONE_19
}

function divDownMagU(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error('Zero division')
  return (a * ONE) / b
}

function divDownMag(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error('Zero division')
  if (a === 0n) return 0n
  const aInflated = a * ONE
  return aInflated / b
}

function mulDownMag(a: bigint, b: bigint): bigint {
  return (a * b) / ONE
}

function scalarProd(t1: Vector2, t2: Vector2): bigint {
  return mulDownMag(t1.x, t2.x) + mulDownMag(t1.y, t2.y)
}

function mulA(params: GyroEParams, tp: Vector2): Vector2 {
  return {
    x:
      divDownMagU(mulDownMagU(params.c, tp.x), params.lambda) -
      divDownMagU(mulDownMagU(params.s, tp.y), params.lambda),
    y: mulDownMagU(params.s, tp.x) + mulDownMagU(params.c, tp.y),
  }
}
