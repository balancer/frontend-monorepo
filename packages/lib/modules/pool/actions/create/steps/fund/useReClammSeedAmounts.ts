import { Address, parseAbi, parseUnits } from 'viem'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { PoolCreationToken } from '../../types'
import { useReadContract } from 'wagmi'

export const useReClammSeedAmounts = (
  poolAddress: Address | undefined,
  token: PoolCreationToken
) => {
  const { isReClamm } = usePoolCreationForm()

  const { address: tokenAddress, amount: humanAmount, data } = token
  const tokenDecimals = data?.decimals
  const rawAmount = parseUnits(humanAmount!, tokenDecimals!)
  const enabled = !!poolAddress && !!tokenAddress && !!humanAmount && !!tokenDecimals && isReClamm

  const {
    data: initAmounts,
    isLoading: isLoadingInitAmounts,
    isSuccess: isSuccessInitAmounts,
  } = useReadContract({
    address: poolAddress,
    abi: parseAbi([
      'function computeInitialBalancesRaw(address, uint256) view returns (uint256[])',
    ]),
    functionName: 'computeInitialBalancesRaw',
    args: [tokenAddress!, rawAmount],
    query: { enabled },
  })

  return {
    initAmounts,
    isLoadingInitAmounts,
    isSuccessInitAmounts,
  }
}
