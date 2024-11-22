import { Address } from 'viem'
import { Pool } from '../pool/PoolProvider'
import { useHooks } from './HooksProvider'
import { getChainId } from '@repo/lib/config/app.config'

export function useHook(pool: Pool) {
  const { metadata } = useHooks()
  const hasHook = !!pool.hook?.address

  const hookAddress = (pool.hook?.address || '0x') as Address
  const chainId = getChainId(pool.chain)

  const hook = metadata?.find(metadata => {
    const metadataAddresses = metadata.addresses[chainId.toString()]
    return metadataAddresses.includes(hookAddress)
  })

  const hasHookData = !!hook

  return {
    hasHook,
    hookAddress,
    hasHookData,
    hook,
  }
}
