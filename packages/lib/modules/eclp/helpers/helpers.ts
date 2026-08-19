import { ONE } from './constants'

////////
/// Normalize balances
////////
export function _normalizeBalances(
  balances: [bigint, bigint],
  decimals: [number, number]
): [bigint, bigint] {
  const scalingFactors = decimals.map(d => BigInt(10) ** BigInt(d))

  return [
    (balances[0] * ONE) / (scalingFactors[0] ?? 1n),
    (balances[1] * ONE) / (scalingFactors[1] ?? 1n),
  ]
}
