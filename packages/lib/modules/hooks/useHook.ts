import {
  GqlChain,
  GqlHook,
  GqlPoolTokenDetail,
} from '@repo/lib/shared/services/api/generated/graphql'
import { useHooks } from './HooksProvider'
import { getChainId } from '@repo/lib/config/app.config'

export function useHook({
  hook,
  poolTokens,
  chain,
}: {
  hook: GqlHook | null | undefined
  poolTokens: GqlPoolTokenDetail[]
  chain: GqlChain
}) {
  const { metadata } = useHooks()
  const hasHook = !!hook?.address
  const hasNestedHook = poolTokens.map(token => token.nestedPool?.hook).some(Boolean)

  const hookAddresses = [
    ...(hasHook ? [hook.address] : []),
    ...poolTokens.map(token => token.nestedPool?.hook?.address),
  ]

  const chainId = getChainId(chain)

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
