import { Address, parseAbi, parseUnits } from 'viem'
import { PoolCreationToken } from '../../types'
import { useReadContract } from 'wagmi'

export const useReClammInitAmounts = (
  isReClamm: boolean,
  poolAddress: Address | undefined,
  token: PoolCreationToken
) => {
  const { address: tokenAddress, amount: tokenAmount, data } = token
  const tokenDecimals = data?.decimals
  const rawAmount = parseUnits(tokenAmount!, tokenDecimals!)
  const enabled = !!poolAddress && !!tokenAddress && !!tokenAmount && !!tokenDecimals && isReClamm

  const { data: reClammInitAmounts } = useReadContract({
    address: poolAddress,
    abi: parseAbi([
      'function computeInitialBalancesRaw(address, uint256) view returns (uint256[])',
    ]),
    functionName: 'computeInitialBalancesRaw',
    args: [tokenAddress!, rawAmount],
    query: { enabled },
  })

  return { reClammInitAmounts }
}
