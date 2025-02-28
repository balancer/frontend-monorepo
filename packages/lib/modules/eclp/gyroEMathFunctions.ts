import { ONE_XP, ONE } from './constants'
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
  sqrt,
} from './gyroSignedFixedPoint'
import {
  DerivedGyroEParams,
  GyroEParams,
  QParams,
  Vector2,
  virtualOffset0,
  virtualOffset1,
  calcXpXpDivLambdaLambda,
} from './gyroEMathHelpers'

/////////
/// SPOT PRICE AFTER SWAP CALCULATIONS
/////////

export function calcSpotPriceYGivenX(
  x: bigint,
  params: GyroEParams,
  d: DerivedGyroEParams,
  r: Vector2
): bigint {
  const ab: Vector2 = {
    x: virtualOffset0(params, d, r),
    y: virtualOffset1(params, d, r),
  }
  const newSpotPriceFactor = solveDerivativeQuadraticSwap(
    params.lambda,
    x,
    params.s,
    params.c,
    r,
    ab,
    d.tauBeta,
    d.dSq
  )
  return newSpotPriceFactor
}

export function calcSpotPriceXGivenY(
  y: bigint,
  params: GyroEParams,
  d: DerivedGyroEParams,
  r: Vector2
): bigint {
  const ba: Vector2 = {
    x: virtualOffset1(params, d, r),
    y: virtualOffset0(params, d, r),
  }
  const newSpotPriceFactor = solveDerivativeQuadraticSwap(
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
  return newSpotPriceFactor
}

function solveDerivativeQuadraticSwap(
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
  q.b = mulUpXpToNpU(mulDownMagU(s, c), divXpU(lamBar.y, dSq))

  const sTerm: Vector2 = {
    x: divXpU(mulDownMagU(mulDownMagU(lamBar.y, s), s), dSq),
    y: divXpU(mulUpMagU(mulUpMagU(lamBar.x, s), s), dSq + 1n) + 1n,
  }
  sTerm.x = ONE_XP - sTerm.x
  sTerm.y = ONE_XP - sTerm.y

  q.c = calcXpXpDivLambdaLambda(x, r, lambda, s, c, tauBeta, dSq) * -1n
  q.c = q.c + mulDownXpToNpU(mulDownMagU(r.y, r.y), sTerm.y) // r.y === currentInv + err
  q.c = q.c > 0n ? sqrt(q.c, 5n) : 0n

  q.c = mulDown(mulDown(q.c, lambda), lambda)
  q.c = divDown(xp, q.c)

  if (q.b - q.c > 0n) {
    q.a = mulUpXpToNpU(q.b - q.c, divXpU(ONE_XP, sTerm.y) + 1n)
  } else {
    q.a = mulUpXpToNpU(q.b - q.c, divXpU(ONE_XP, sTerm.x))
  }
  return q.a
}

/////////
/// SPOT PRICE DERIVATIVE CALCULATIONS
/////////

function setup(
  balances: bigint[],
  params: GyroEParams,
  derived: DerivedGyroEParams,
  fee: bigint,
  rVec: Vector2,
  ixVar: number
) {
  const r = rVec.y
  const { c, s, lambda } = params
  const [x0, y0] = balances
  const a = virtualOffset0(params, derived, rVec)
  const b = virtualOffset1(params, derived, rVec)
  const ls = ONE - divDown(ONE, mulDown(lambda, lambda))
  const f = ONE - fee

  let R: bigint
  if (ixVar === 0) {
    R = sqrt(
      mulDown(mulDown(r, r), ONE - mulDown(ls, mulDown(s, s))) -
        divDown(mulDown(x0 - a, x0 - a), mulDown(lambda, lambda)),
      5n
    )
  } else {
    R = sqrt(
      mulDown(mulDown(r, r), ONE - mulDown(ls, mulDown(c, c))) -
        divDown(mulDown(y0 - b, y0 - b), mulDown(lambda, lambda)),
      5n
    )
  }

  return { x0, y0, c, s, lambda, a, b, ls, f, r, R }
}

export function normalizedLiquidityYIn(
  balances: bigint[],
  params: GyroEParams,
  derived: DerivedGyroEParams,
  fee: bigint,
  rVec: Vector2
): bigint {
  const { y0, c, s, lambda, b, ls, R } = setup(balances, params, derived, fee, rVec, 1)

  const returnValue = divDown(
    mulDown(
      divDown(ONE, ONE - mulDown(ls, mulDown(c, c))),
      mulDown(
        R,
        mulDown(
          mulDown(mulDown(mulDown(mulDown(ls, s), c), mulDown(lambda, lambda)), R) - (y0 - b),
          mulDown(mulDown(mulDown(mulDown(ls, s), c), mulDown(lambda, lambda)), R) - (y0 - b)
        )
      )
    ),
    mulDown(mulDown(lambda, lambda), mulDown(R, R)) + mulDown(y0 - b, y0 - b)
  )

  return returnValue
}

export function normalizedLiquidityXIn(
  balances: bigint[],
  params: GyroEParams,
  derived: DerivedGyroEParams,
  fee: bigint,
  rVec: Vector2
): bigint {
  const { x0, c, s, lambda, a, ls, R } = setup(balances, params, derived, fee, rVec, 0)

  const returnValue = divDown(
    mulDown(
      divDown(ONE, ONE - mulDown(ls, mulDown(s, s))),
      mulDown(
        R,
        mulDown(
          mulDown(mulDown(mulDown(mulDown(ls, s), c), mulDown(lambda, lambda)), R) - (x0 - a),
          mulDown(mulDown(mulDown(mulDown(ls, s), c), mulDown(lambda, lambda)), R) - (x0 - a)
        )
      )
    ),
    mulDown(mulDown(lambda, lambda), mulDown(R, R)) + mulDown(x0 - a, x0 - a)
  )

  return returnValue
}

export function dPyDXIn(
  balances: bigint[],
  params: GyroEParams,
  derived: DerivedGyroEParams,
  fee: bigint,
  rVec: Vector2
): bigint {
  const { x0, c, s, lambda, a, ls, R } = setup(balances, params, derived, fee, rVec, 0)

  const returnValue = divDown(
    mulDown(
      ONE - mulDown(ls, mulDown(s, s)),
      divDown(ONE, mulDown(mulDown(lambda, lambda), R)) +
        divDown(
          mulDown(x0 - a, x0 - a),
          mulDown(
            mulDown(mulDown(lambda, lambda), mulDown(lambda, lambda)),
            mulDown(R, mulDown(R, R))
          )
        )
    ),
    mulDown(
      mulDown(mulDown(ls, s), c) - divDown(x0 - a, mulDown(mulDown(lambda, lambda), R)),
      mulDown(mulDown(ls, s), c) - divDown(x0 - a, mulDown(mulDown(lambda, lambda), R))
    )
  )

  return returnValue
}

export function dPxDYIn(
  balances: bigint[],
  params: GyroEParams,
  derived: DerivedGyroEParams,
  fee: bigint,
  rVec: Vector2
): bigint {
  const { y0, c, s, lambda, b, ls, R } = setup(balances, params, derived, fee, rVec, 1)

  const returnValue = divDown(
    mulDown(
      ONE - mulDown(ls, mulDown(c, c)),
      divDown(ONE, mulDown(mulDown(lambda, lambda), R)) +
        divDown(
          mulDown(y0 - b, y0 - b),
          mulDown(
            mulDown(mulDown(lambda, lambda), mulDown(lambda, lambda)),
            mulDown(R, mulDown(R, R))
          )
        )
    ),
    mulDown(
      mulDown(mulDown(ls, s), c) - divDown(y0 - b, mulDown(mulDown(lambda, lambda), R)),
      mulDown(mulDown(ls, s), c) - divDown(y0 - b, mulDown(mulDown(lambda, lambda), R))
    )
  )

  return returnValue
}

export function dPxDXOut(
  balances: bigint[],
  params: GyroEParams,
  derived: DerivedGyroEParams,
  fee: bigint,
  rVec: Vector2
): bigint {
  const { x0, s, lambda, a, ls, R, f } = setup(balances, params, derived, fee, rVec, 0)

  const returnValue = mulDown(
    divDown(ONE, mulDown(f, ONE - mulDown(ls, mulDown(s, s)))),
    divDown(ONE, mulDown(mulDown(lambda, lambda), R)) +
      divDown(
        mulDown(x0 - a, x0 - a),
        mulDown(
          mulDown(mulDown(lambda, lambda), mulDown(lambda, lambda)),
          mulDown(mulDown(R, R), R)
        )
      )
  )

  return returnValue
}

export function dPyDYOut(
  balances: bigint[],
  params: GyroEParams,
  derived: DerivedGyroEParams,
  fee: bigint,
  rVec: Vector2
): bigint {
  const { y0, c, lambda, b, ls, R, f } = setup(balances, params, derived, fee, rVec, 1)

  const returnValue = mulDown(
    divDown(ONE, mulDown(f, ONE - mulDown(ls, mulDown(c, c)))),
    divDown(ONE, mulDown(mulDown(lambda, lambda), R)) +
      divDown(
        mulDown(y0 - b, y0 - b),
        mulDown(
          mulDown(mulDown(lambda, lambda), mulDown(lambda, lambda)),
          mulDown(mulDown(R, R), R)
        )
      )
  )

  return returnValue
}
