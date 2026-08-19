import { useQuery } from '@tanstack/react-query'
import { Address } from 'viem'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getChainId } from '@repo/lib/config/app.config'
import { useMemo } from 'react'

export type PoolHookMetadata = {
  id: string
  name: string
  description: string
  addresses: {
    [chainId: string]: Address[]
  }
}

export function usePoolHooksWhitelist(network: GqlChain) {
  const { data, isPending: isPendingPoolHooksWhitelist } = useQuery({
    queryKey: ['poolHooksWhitelist'],
    queryFn: async () => {
      const response = await fetch(
        'https://raw.githubusercontent.com/balancer/metadata/main/hooks/index.json'
      )

      const data: PoolHookMetadata[] = await response.json()
      return data
    },
  })

  const chainId = getChainId(network)

  const poolHooksWhitelist = useMemo(() => {
    return (
      data
        ?.map(hook => {
          const hooksArray = hook.addresses[chainId.toString()]
          const value = hooksArray?.[hooksArray.length - 1] // use the most recently deployed hook?
          return value ? { label: hook.name, value } : null
        })
        .filter((hook): hook is { label: string; value: Address } => hook !== null) || []
    )
  }, [data, chainId])

  return {
    poolHooksWhitelist,
    isPendingPoolHooksWhitelist,
  }
}
