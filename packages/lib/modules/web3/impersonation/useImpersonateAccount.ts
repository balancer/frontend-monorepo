import { shouldUseAnvilFork } from '@repo/lib/config/app.config'
import { useSetErc20Balance } from '@repo/lib/test/anvil/useSetErc20Balance'
import { defaultManualForkOptions } from '@repo/lib/test/utils/wagmi/fork-options'
import { forkClient, setTokenBalances } from '@repo/lib/test/utils/wagmi/fork.helpers'
import { Address } from 'viem'
import { createConfig, useConnect } from 'wagmi'

type WagmiConfig = ReturnType<typeof createConfig>

export function useImpersonateAccount() {
  const { connectors, connectAsync } = useConnect()
  const setBalance = useSetErc20Balance()

  type ConnectMockProps = {
    impersonatedAddress?: Address
    wagmiConfig: WagmiConfig
  }

  return { impersonateAccount }

  async function impersonateAccount({ wagmiConfig, impersonatedAddress }: ConnectMockProps) {
    if (!impersonatedAddress) return
    // E2E dev tests impersonate account in the fork to be able to sign and run transactions against the anvil fork
    if (shouldUseAnvilFork) {
      await forkClient.impersonateAccount({
        address: impersonatedAddress,
      })

      // TODO: we are using window to globally set the fork options from E2E tests. Explore better ways to do this.
      const chainId = window.forkOptions?.chainId ?? defaultManualForkOptions.chainId
      const forkBalances = window.forkOptions?.forkBalances ?? defaultManualForkOptions.forkBalances
      console.log('window.forkOptions', JSON.stringify(window.forkOptions, null, 2))

      if (forkBalances[chainId]) {
        await setTokenBalances({
          impersonatedAddress,
          wagmiConfig,
          setBalance,
          tokenBalances: forkBalances,
          chainId,
        })
      }

      console.log('🥸 Impersonating with ', { impersonatedAddress, chainId })

      // if you don't pass chainId you will be prompted to switch chain (check if it uses mainnet by default)
      await connectAsync({ connector: connectors[connectors.length - 1], chainId })
    }
  }
}
