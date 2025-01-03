import { getNetworkConfig } from '@repo/lib/config/app.config'
import { setTag } from '@sentry/nextjs'
import { useEffect } from 'react'
import { useUserAccount } from '../modules/web3/UserAccountProvider'
import { useProjectConfig } from './ProjectConfigProvider'

export function useNetworkConfig() {
  let defaultNetwork

  const { chain } = useUserAccount()
  const { defaultNetwork: projectDefaultNetwork } = useProjectConfig()

  if (!chain) {
    defaultNetwork = projectDefaultNetwork
  }

  useEffect(() => {
    setTag('walletNetwork', chain?.name)
  }, [chain])

  return getNetworkConfig(chain?.id, defaultNetwork)
}
