'use client'

import { usePoolListQueryState } from '@repo/lib/modules/pool/PoolList/usePoolListQueryState'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const POOLS_PATH = '/pools'

export function PoolsNetworkWatcher() {
  const { chain } = useUserAccount()
  const { setNetworks, networks } = usePoolListQueryState()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname === POOLS_PATH && chain) {
      if (searchParams.size === 0 || (searchParams.size === 1 && networks.length > 0)) {
        if (chain.id === 146) {
          setNetworks([GqlChain.Sonic])
        } else if (chain.id === 10) {
          setNetworks([GqlChain.Optimism])
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, pathname, searchParams.size])

  return <>{null}</>
}
