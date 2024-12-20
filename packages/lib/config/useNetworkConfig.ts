import { getNetworkConfig } from '@repo/lib/config/app.config'
import { setTag } from '@sentry/nextjs'
import { useEffect } from 'react'
import { useUserAccount } from '../modules/web3/UserAccountProvider'
import { PROJECT_CONFIG } from './getProjectConfig'

export function useNetworkConfig() {
  let defaultNetwork

  const { chain } = useUserAccount()

  if (!chain) {
    defaultNetwork = PROJECT_CONFIG.defaultNetwork
  }

  useEffect(() => {
    setTag('walletNetwork', chain?.name)
  }, [chain])

  return getNetworkConfig(chain?.id, defaultNetwork)
}
