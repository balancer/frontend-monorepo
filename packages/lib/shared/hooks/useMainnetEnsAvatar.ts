import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { normalize } from 'viem/ens'
import { useEnsAvatar, useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { useIsMainnetSupported } from './useIsChainSupported'

export function useMainnetEnsData() {
  const { userAddress } = useUserAccount()
  const mainnetConfigured = useIsMainnetSupported()
  const isEnsNameSupported = mainnetConfigured
  const { data: ensName } = useEnsName({
    chainId: mainnet.id,
    address: userAddress,
    query: {
      enabled: isEnsNameSupported,
    },
  })
  const safeNormalize = (ensName: string) => {
    try {
      return normalize(ensName)
    } catch {
      /* ignore */
    }
  }

  const { data: ensAvatar } = useEnsAvatar({
    chainId: mainnet.id,
    name: ensName ? safeNormalize(ensName) : undefined,
    query: {
      enabled: isEnsNameSupported,
    },
  })

  return { ensAvatar, ensName }
}
