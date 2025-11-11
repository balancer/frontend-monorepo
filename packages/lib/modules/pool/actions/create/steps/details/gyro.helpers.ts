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

/**
 * Calculates peak price from E-CLP rotation components
 * @param c - cosθ component (normalized such that c² + s² = 1)
 * @param s - sinθ component (normalized such that c² + s² = 1)
 * @returns peakPrice as tan(θ) = s/c
 */
export function calculatePeakPrice({ c, s }: { c: string; s: string }): string {
  if (!c || !s || Number(c) === 0) return ''

  // Since tan(θ) = sin(θ)/cos(θ) = s/c
  // Simply divide s by c to recover the original tan(θ) value
  const peakPrice = bn(s).div(bn(c))

  return peakPrice.toString()
}
