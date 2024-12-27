'use client'

import { usePoolListQueryState } from '@repo/lib/modules/pool/PoolList/usePoolListQueryState'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

const POOLS_PATH = '/pools'

export function PoolsNetworkWatcher() {
  const { chain } = useUserAccount()
  const { toggleNetwork } = usePoolListQueryState()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname === POOLS_PATH && searchParams.size === 0 && chain) {
      if (chain.id === 146) {
        toggleNetwork(true, GqlChain.Sonic)
      } else if (chain.id === 10) {
        toggleNetwork(true, GqlChain.Optimism)
      }
    }
  }, [chain, pathname, searchParams.size])

  return <>{null}</>
}
