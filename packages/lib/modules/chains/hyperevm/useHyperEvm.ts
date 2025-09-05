import * as hl from '@nktkas/hyperliquid'
import { useMutation } from '@tanstack/react-query'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { useWalletClient } from 'wagmi'
import { usePublicClient } from 'wagmi'
// eslint-disable-next-line no-restricted-imports
import { useAccount } from 'wagmi'
import { ChainId } from '@balancer/sdk'
import { useQuery } from '@tanstack/react-query'

export function useHyperEvm({
  isHyperEvmTx,
  isContractDeploymentStep,
}: {
  isHyperEvmTx: boolean
  isContractDeploymentStep: boolean
}) {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const publicClient = usePublicClient()

  const enabled = isHyperEvmTx && publicClient?.chain.id === ChainId.HYPER_EVM

  const { data: isUsingBigBlocks, refetch: refetchIsUsingBigBlocks } = useQuery({
    queryKey: ['isUsingBigBlocks', publicClient?.chain.id, address],
    queryFn: async () => {
      if (!publicClient || !address) return false
      if (publicClient.chain.id !== ChainId.HYPER_EVM) return false

      const isUsingBigBlocks: boolean = await publicClient.transport.request({
        method: 'eth_usingBigBlocks',
        params: [address],
      })
      return isUsingBigBlocks
    },
    enabled,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })

  async function setUsingBigBlocksFn(usingBigBlocks: boolean) {
    if (!walletClient) throw new Error('Wallet client not found')

    // Create arbitrary wallet
    const agentPrivateKey = generatePrivateKey()
    const account = privateKeyToAccount(agentPrivateKey)

    const transport = new hl.HttpTransport()
    const userExchangeClient = new hl.ExchangeClient({
      wallet: walletClient,
      transport,
    })

    // Approve arbitrary wallet to execute orders on behalf of the user
    await userExchangeClient.approveAgent({
      agentAddress: account.address,
      // no name agent always prunes the last no name agent so we do not have to worry about agent cap?
      agentName: '', // https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallet-pruning
    })

    // Execute block toggle using agent wallet
    const agentExchangeClient = new hl.ExchangeClient({
      wallet: agentPrivateKey,
      transport,
    })

    await agentExchangeClient.evmUserModify({
      usingBigBlocks,
    })
  }

  const {
    mutate: setUsingBigBlocks,
    isPending: isSetUsingBigBlocksPending,
    error: setUsingBigBlocksError,
  } = useMutation({
    mutationFn: setUsingBigBlocksFn,
    onSuccess: () => {
      refetchIsUsingBigBlocks()
    },
    onError: error => {
      console.error(error)
    },
  })

  const shouldUseBigBlocks = enabled && !isUsingBigBlocks && isContractDeploymentStep // big blocks only necessary to deploy pool contract
  const shouldUseSmallBlocks = enabled && !!isUsingBigBlocks && !isContractDeploymentStep // small blocks faster for non contract deployment txs
  const shouldToggleBlockSize = shouldUseSmallBlocks || shouldUseBigBlocks

  return {
    isUsingBigBlocks,
    setUsingBigBlocks,
    isSetUsingBigBlocksPending,
    setUsingBigBlocksError,
    shouldUseBigBlocks,
    shouldUseSmallBlocks,
    shouldToggleBlockSize,
  }
}
