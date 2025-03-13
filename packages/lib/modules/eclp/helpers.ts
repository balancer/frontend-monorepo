import { ONE } from './constants'

////////
/// Normalize balances
////////
export function _normalizeBalances(balances: bigint[], decimals: number[]): bigint[] {
  const scalingFactors = decimals.map(d => BigInt(10) ** BigInt(d))

  return balances.map((bal, index) => (bal * ONE) / scalingFactors[index])
}
