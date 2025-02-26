import { useHooks } from './HooksProvider'
import { getChainId } from '@repo/lib/config/app.config'
import { Pool, PoolCoreMinimal } from '../pool/pool.types'
import { PoolListItem } from '../pool/pool.types'

export function useHook(pool: Pool | PoolListItem | PoolCoreMinimal) {
  const { metadata } = useHooks()
  const hasHook = 'hook' in pool ? !!pool.hook?.address : false
  const poolTokens = pool.poolTokens.filter(
    (token): token is Pool['poolTokens'][number] => 'nestedPool' in token
  )
  const hasNestedHook = poolTokens.map(token => token.nestedPool?.hook).some(Boolean)

  const hookAddresses = [
    ...('hook' in pool && hasHook ? [pool.hook?.address] : []),
    ...poolTokens.map(token => token.nestedPool?.hook?.address),
  ]

  const chainId = getChainId(pool.chain)

  const hooks = hookAddresses
    .map(hookAddress =>
      metadata?.find(metadata => {
        const metadataAddresses = metadata.addresses[chainId.toString()]?.map(address =>
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
