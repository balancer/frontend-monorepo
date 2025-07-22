'use client'

import { useIsUsingBigBlocks } from './useIsUsingBigBlocks'
import * as hl from '@nktkas/hyperliquid'
import { useMutation } from '@tanstack/react-query'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { useWalletClient } from 'wagmi'

export function useToggleBlockSize() {
  const { data: isUsingBigBlocks, refetch: refetchIsUsingBigBlocks } = useIsUsingBigBlocks()
  const { data: walletClient } = useWalletClient()

  async function toggleBlockSize() {
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
      usingBigBlocks: !isUsingBigBlocks,
    })
  }

  return useMutation({
    mutationFn: toggleBlockSize,
    onSuccess: () => {
      refetchIsUsingBigBlocks()
    },
    onError: error => {
      console.error(error)
    },
  })
}
