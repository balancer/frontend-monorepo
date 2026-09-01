import { Address, parseAbi } from 'viem'
import { PoolCreationToken } from '../../types'
import { useReadContract } from 'wagmi'
import { parseAmount } from '@repo/lib/shared/utils/numbers'

// parseAmount returns 0n for the transient states an amount field holds while typing ('', '0.')
// and throws on values a float can stringify to ('5e-8'). Neither is a seed amount, so report
// null and let `enabled` skip the call instead of computing balances for zero or throwing during
// render. Metadata still loading (no amount or decimals) is null for the same reason.
function parseSeedAmount(amount: string | undefined, decimals: number | undefined): bigint | null {
  if (!amount || decimals === undefined) return null

  try {
    const rawAmount = parseAmount(amount, decimals)
    return rawAmount > 0n ? rawAmount : null
  } catch {
    return null
  }
}

export const useAutoRangeInitAmounts = (
  isAutoRange: boolean,
  poolAddress: Address | undefined,
  token: PoolCreationToken
) => {
  const { address: tokenAddress, amount: tokenAmount, data } = token
  const rawAmount = parseSeedAmount(tokenAmount, data?.decimals)
  const enabled = !!poolAddress && !!tokenAddress && rawAmount !== null && isAutoRange

  const { data: autoRangeInitAmounts } = useReadContract({
    address: poolAddress,
    abi: parseAbi([
      'function computeInitialBalancesRaw(address, uint256) view returns (uint256[])',
    ]),
    functionName: 'computeInitialBalancesRaw',
    // Only read while enabled, where rawAmount is always a positive bigint.
    args: [tokenAddress!, rawAmount ?? 0n],
    query: { enabled },
  })

  return { autoRangeInitAmounts }
}
