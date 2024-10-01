import { getNetworkConfig } from './app.config'
import { setTag } from '@sentry/nextjs'
import { useEffect } from 'react'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

export function useNetworkConfig() {
  const { chain } = useUserAccount()

  useEffect(() => {
    setTag('walletNetwork', chain?.name)
  }, [chain])

  return getNetworkConfig(chain?.id)
}
