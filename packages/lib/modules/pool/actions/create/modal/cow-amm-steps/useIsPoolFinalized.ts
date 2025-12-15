import { useReadContract } from 'wagmi'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { getChainId } from '@repo/lib/config/app.config'
import { isCowPool } from '../../helpers'
import { cowAmmPoolAbi } from '@repo/lib/modules/web3/contracts/abi/cowAmmAbi'

export function useIsPoolFinalized() {
  const { poolCreationForm, poolAddress } = usePoolCreationForm()
  const [poolType, network] = poolCreationForm.getValues(['poolType', 'network'])
  const chainId = getChainId(network)

  const { data, isLoading, refetch } = useReadContract({
    address: poolAddress,
    abi: cowAmmPoolAbi,
    functionName: 'isFinalized',
    chainId,
    query: { enabled: !!poolAddress && isCowPool(poolType) },
  })

  return { isPoolFinalized: !!data, isLoadingIsFinalized: isLoading, refetchIsFinalized: refetch }
}
