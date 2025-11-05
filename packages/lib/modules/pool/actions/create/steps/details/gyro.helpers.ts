import { bn } from '@repo/lib/shared/utils/numbers'

/**
 * Calculates rotation components "c" and "s" for E-CLP parameters
 * @param peakPrice - tan(θ) where θ is the rotation angle (s/c)
 * @returns c and s with 18 decimal precision
 */
export function calculateRotationComponents(peakPrice: string): { c: string; s: string } {
  if (!peakPrice || Number(peakPrice) === 0) return { c: '', s: '' }

  // Convert input to precise decimal representation of tan(θ)
  const tanθ = bn(peakPrice)

  // Calculate hypotenuse of right triangle with legs (1, tanθ)
  // This represents √(1 + tan²θ) from Pythagorean theorem
  const tanSquared = tanθ.times(tanθ)
  const hypotenuse = tanSquared.plus(1).sqrt()

  // Calculate normalized components maintaining c² + s² = 1 identity
  // c = cosθ = 1/√(1 + tan²θ)
  // s = sinθ = tanθ/√(1 + tan²θ)
  const c = bn(1).div(hypotenuse).toFixed(18)
  const s = tanθ.div(hypotenuse).toFixed(18)

  return { c, s }
}

type GyroEclpParams = {
  alpha: number
  beta: number
  c: number
  s: number
  lambda: number
  rateA: number
  rateB: number
  spotPriceWithoutRate: number | null
}

export function getEclpInitAmountsRatio({
  alpha,
  beta,
  c,
  s,
  lambda,
  rateA,
  rateB,
  spotPriceWithoutRate,
}: GyroEclpParams) {
  if (!spotPriceWithoutRate) return undefined

  const rHint = 1000
  const tauAlpha = getTau(alpha, c, s, lambda)
  const tauBeta = getTau(beta, c, s, lambda)
  const tauSpotPrice = getTau(spotPriceWithoutRate, c, s, lambda)

  const amountTokenA =
    rateA *
    rHint *
    (c * lambda * tauBeta[0] +
      s * tauBeta[1] -
      (c * lambda * tauSpotPrice[0] + s * tauSpotPrice[1]))
  const amountTokenB =
    rateB *
    rHint *
    (-s * lambda * tauAlpha[0] +
      c * tauAlpha[1] -
      (-s * lambda * tauSpotPrice[0] + c * tauSpotPrice[1]))
  const ratio = amountTokenA / amountTokenB

  return ratio
}

function getTau(price: number, c: number, s: number, lambda: number) {
  const dSq = c * c + s * s
  const d = Math.sqrt(dSq)
  const dPrice =
    1 /
    Math.sqrt(
      Math.pow(c / d + (price * s) / d, 2) / (lambda * lambda) +
        Math.pow((price * c) / d - s / d, 2)
    )
  return [(price * c - s) * dPrice, ((c + s * price) * dPrice) / lambda]
}
