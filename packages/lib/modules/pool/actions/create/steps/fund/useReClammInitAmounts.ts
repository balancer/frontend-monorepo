import { Address, parseAbi, parseUnits } from 'viem'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolCreationToken } from '../../types'
import { useReadContract } from 'wagmi'

export const useReClammInitAmounts = (
  poolAddress: Address | undefined,
  token: PoolCreationToken
) => {
  const { isReClamm } = usePoolCreationForm()

  const { address: tokenAddress, amount: tokenAmount, data } = token
  const tokenDecimals = data?.decimals
  const rawAmount = parseUnits(tokenAmount!, tokenDecimals!)
  const enabled = !!poolAddress && !!tokenAddress && !!tokenAmount && !!tokenDecimals && isReClamm

  const { data: initAmounts } = useReadContract({
    address: poolAddress,
    abi: parseAbi([
      'function computeInitialBalancesRaw(address, uint256) view returns (uint256[])',
    ]),
    functionName: 'computeInitialBalancesRaw',
    args: [tokenAddress!, rawAmount],
    query: { enabled },
  })

  return { initAmounts }
}
