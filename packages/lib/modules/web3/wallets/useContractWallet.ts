import { usePublicClient } from 'wagmi'
import { useUserAccount } from '../UserAccountProvider'
import { PublicClient } from 'viem'
import { Address } from 'viem'
import { useQuery } from '@tanstack/react-query'

export function useContractWallet() {
  const { userAddress, chainId, isConnected, isLoading: isUserLoading } = useUserAccount()
  const publicClient = usePublicClient({ chainId })

  const { data, isPending: isBytecodeLoading } = useQuery({
    queryKey: ['address-bytecode', userAddress],
    queryFn: () => fetchBytecode(publicClient, userAddress),
    enabled: !isUserLoading && !!userAddress,
  })

  if (!isConnected) return { isContractWallet: false, isLoading: isUserLoading }

  return {
    isContractWallet: !!data?.bytecode && data?.bytecode.length > 0,
    isLoading: isUserLoading || isBytecodeLoading,
  }
}

async function fetchBytecode(client: PublicClient | undefined, address: Address) {
  if (!client) return undefined
  const bytecode = await client.getCode({ address })
  return { bytecode }
}
