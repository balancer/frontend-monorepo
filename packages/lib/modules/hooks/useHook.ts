import { Pool } from '../pool/PoolProvider'
import { useHooks } from './HooksProvider'
import { getChainId } from '@repo/lib/config/app.config'

export function useHook(pool: Pool) {
  const { metadata } = useHooks()
  const hasHook = !!pool.hook?.address
  const hasNestedHook = pool.poolTokens.map(token => token.nestedPool?.hook).some(Boolean)

  const hookAddresses = [
    ...(hasHook ? [pool.hook?.address] : []),
    ...pool.poolTokens.map(token => token.nestedPool?.hook?.address),
  ]

  const chainId = getChainId(pool.chain)

  const hooks = hookAddresses
    .map(hookAddress =>
      metadata?.find(metadata => {
        const metadataAddresses = metadata.addresses[chainId.toString()].map(address =>
          address.toLowerCase()
        )
        return (
          hookAddress && metadataAddresses && metadataAddresses.includes(hookAddress.toLowerCase())
        )
      })
    )
    .filter(Boolean)

  const hasHookData = !!hooks && hooks.length > 0

  return {
    hasHook,
    hasNestedHook,
    hookAddresses,
    hasHookData,
    hooks,
  }
}
