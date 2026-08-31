import { Address, parseAbi } from 'viem'
import { PoolCreationToken } from '../../types'
import { useReadContract } from 'wagmi'
import { parseAmount } from '@repo/lib/shared/utils/numbers'

export const useAutoRangeInitAmounts = (
  isAutoRange: boolean,
  poolAddress: Address | undefined,
  token: PoolCreationToken
) => {
  const { address: tokenAddress, amount: tokenAmount, data } = token
  const tokenDecimals = data?.decimals
  const rawAmount = parseAmount(tokenAmount!, tokenDecimals!)
  const enabled = !!poolAddress && !!tokenAddress && !!tokenAmount && !!tokenDecimals && isAutoRange

  const { data: autoRangeInitAmounts } = useReadContract({
    address: poolAddress,
    abi: parseAbi([
      'function computeInitialBalancesRaw(address, uint256) view returns (uint256[])',
    ]),
    functionName: 'computeInitialBalancesRaw',
    args: [tokenAddress!, rawAmount],
    query: { enabled },
  })

  return { autoRangeInitAmounts }
}
