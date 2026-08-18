import { ONE } from './constants'
import { normalizedLiquidityXIn } from './gyroEMathFunctions'
import type { DerivedGyroEParams, GyroEParams, Vector2 } from './gyroEMathHelpers'

const params: GyroEParams = {
  alpha: 0n,
  beta: 0n,
  c: ONE,
  s: 0n,
  lambda: ONE,
}

const derived: DerivedGyroEParams = {
  tauAlpha: { x: 0n, y: 0n },
  tauBeta: { x: 0n, y: 0n },
  u: 0n,
  v: 0n,
  w: 0n,
  z: 0n,
  dSq: ONE,
}

const invariant: Vector2 = { x: ONE, y: ONE }

describe('normalizedLiquidityXIn', () => {
  it.each([{ balances: [] }, { balances: [ONE] }])(
    'rejects balances with fewer than two entries',
    ({ balances }) => {
      expect(() => normalizedLiquidityXIn(balances, params, derived, 0n, invariant)).toThrow(
        'ECLP requires at least two balances'
      )
    }
  )
})
