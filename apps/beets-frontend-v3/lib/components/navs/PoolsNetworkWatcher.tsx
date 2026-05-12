'use client'

import { usePoolListQueryState } from '@repo/lib/modules/pool/PoolList/usePoolListQueryState'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const POOLS_PATH = '/pools'

export function PoolsNetworkWatcher() {
  const { chain } = useUserAccount()
  const { setNetworks, networks } = usePoolListQueryState()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Derive during render (replaces useEffect-based state mirror)
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const derivedNetworks: GqlChain[] | undefined =
    pathname === POOLS_PATH &&
    chain &&
    (searchParams.size === 0 || (searchParams.size === 1 && networks.length > 0))
      ? chain.id === 146
        ? [GqlChain.Sonic]
        : chain.id === 10
          ? [GqlChain.Optimism]
          : undefined
      : undefined

  const [prevNetworks, setPrevNetworks] = useState(derivedNetworks)
  if (derivedNetworks !== undefined && prevNetworks !== derivedNetworks) {
    setPrevNetworks(derivedNetworks)
    setNetworks(derivedNetworks)
  }

  return <>{null}</>
}
