import { useState, useEffect, useCallback } from 'react'
import { getMessagesBySrcTxHash } from '@layerzerolabs/scan-client'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'

import { Address } from 'viem'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { SyncTxHashes } from './CrossChainSyncProvider'
import { secs } from '@/lib/shared/utils/time'

const REFETCH_GET_LAYER_ZERO_TX_LINKS_INTERVAL = secs(5).toMs()

export async function getLayerZeroTxLink(txHash: Address) {
  const { messages } = await getMessagesBySrcTxHash(101, txHash)
  const message = messages[0]
  if (!message) {
    console.error('No message found in Layer Zero')
    return ''
  }
  return `https://layerzeroscan.com/tx/${message.srcTxHash}`
}

export function useLayerZeroTxLinks(syncTxHashes: Record<Address, SyncTxHashes>) {
  const [syncLayerZeroTxLinks, setSyncLayerZeroTxLinks] = useState({} as Record<GqlChain, string>)
  const { userAddress } = useUserAccount()

  const getLayerZeroTxLinkOnInterval = useCallback(
    (networks: GqlChain[]) => {
      let retryCount = 0

      async function updateLinks() {
        for (const network of networks) {
          const hash = syncTxHashes[userAddress]?.[network]
          if (hash) {
            const link = await getLayerZeroTxLink(hash)
            setSyncLayerZeroTxLinks(prev => ({ ...prev, [network]: link }))
          }
        }
      }

      function shouldStopRetrying() {
        const allLinksFetched = networks.every(network => syncLayerZeroTxLinks[network])
        return allLinksFetched || retryCount > 10
      }

      const intervalId = setInterval(async () => {
        await updateLinks()
        retryCount++
        if (shouldStopRetrying()) {
          clearInterval(intervalId)
        }
      }, REFETCH_GET_LAYER_ZERO_TX_LINKS_INTERVAL)

      return intervalId
    },
    [userAddress, syncTxHashes, syncLayerZeroTxLinks]
  )

  useEffect(() => {
    const networks = Object.keys(syncTxHashes[userAddress] || {}) as GqlChain[]
    let intervalId: NodeJS.Timer
    if (networks.length > 0) {
      intervalId = getLayerZeroTxLinkOnInterval(networks)
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [syncTxHashes, userAddress, getLayerZeroTxLinkOnInterval])

  return { syncLayerZeroTxLinks }
}
